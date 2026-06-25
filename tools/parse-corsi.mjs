// Parser dei file in corsi/*.txt -> genera l'asset seed TS.
// Uso: node tools/parse-corsi.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const corsiDir = join(root, 'corsi');
const outFile = join(root, 'libs/server/entities/src/assets/courses-data.ts');

// AREA header (riga "N. AREA: AREA X") -> MacroArea enum member
const AREA_TO_MACRO = {
    'AREA ECONOMICO-STATISTICA': 'ECONOMICS',
    'AREA GIURIDICA': 'LAW',
    'AREA INGEGNERIA': 'ENGINEERING',
    'AREA MEDICA': 'MEDICINE',
};

const TYPE_TO_ENUM = {
    'Laurea Triennale': 'BACHELOR',
    'Laurea Magistrale': 'MASTER',
    'Ciclo Unico': 'SINGLE_CYCLE',
};

const YEAR_TO_ENUM = {
    1: 'FIRST', 2: 'SECOND', 3: 'THIRD',
    4: 'FOURTH', 5: 'FIFTH', 6: 'SIXTH', 7: 'SEVENTH',
};

const stripAccents = (s) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '');

// "COGNOME NOME" / "COGNOME COMPOSTO NOME" -> ultimo token = nome, resto = cognome
function parseDocente(raw) {
    const tokens = raw.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return null;
    const toTitle = (w) =>
        w.split(/(['-])/).map((p) =>
            /['-]/.test(p) ? p : p.charAt(0) + p.slice(1).toLowerCase()
        ).join('');
    const name = toTitle(tokens[tokens.length - 1]);
    const surnameTokens = tokens.slice(0, -1).length ? tokens.slice(0, -1) : [tokens[0]];
    const surname = surnameTokens.map(toTitle).join(' ');
    const slug = (s) => stripAccents(s).toLowerCase().replace(/[^a-z]/g, '');
    const email = `${slug(name)}.${slug(surname)}@unibs.it`;
    return { name, surname, email };
}

const teachers = new Map();   // email -> {name,surname,email}
const degrees = new Map();    // key -> {degreeName,degreeType,degreeYear,macroArea}
const courses = new Map();    // key -> {courseName,teacherEmail,degreeName,degreeType,degreeYear}

const degreeKey = (n, t, y) => `${n}||${t}||${y}`;

const files = readdirSync(corsiDir).filter((f) => f.endsWith('.txt')).sort();

for (const file of files) {
    const lines = readFileSync(join(corsiDir, file), 'utf-8').split('\n');
    let macroArea = null;
    let curDegreeName = null;
    let curType = null;
    let curYear = null;
    let pendingCourse = null; // materia in attesa della riga Docente/i

    const flushPending = () => { pendingCourse = null; };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const mArea = line.match(/AREA:\s*(.+?)\s*$/);
        if (mArea) {
            const macro = AREA_TO_MACRO[mArea[1].trim().toUpperCase()];
            if (macro) macroArea = macro;
            flushPending();
            continue;
        }

        const mCorso = line.match(/^CORSO:\s*(.+?)\s*\[(.+?)\]\s*$/);
        if (mCorso) {
            curDegreeName = mCorso[1].trim();
            curType = TYPE_TO_ENUM[mCorso[2].trim()] ?? null;
            curYear = null;
            flushPending();
            continue;
        }

        const mYear = line.match(/^\s*\[(\d+)°\s*Anno\]\s*$/);
        if (mYear) {
            curYear = YEAR_TO_ENUM[Number(mYear[1])] ?? null;
            flushPending();
            continue;
        }

        const mBullet = line.match(/^\s*•\s*(.+?)\s*\(.+\)\s*$/);
        if (mBullet && macroArea && curDegreeName && curType && curYear) {
            const courseName = mBullet[1].trim();
            const dk = degreeKey(curDegreeName, curType, curYear);
            if (!degrees.has(dk)) {
                degrees.set(dk, {
                    degreeName: curDegreeName,
                    degreeType: curType,
                    degreeYear: curYear,
                    macroArea,
                });
            }
            pendingCourse = { courseName, dk };
            continue;
        }

        const mDoc = line.match(/^\s*Docente\/i:\s*(.+?)\s*$/);
        if (mDoc && pendingCourse) {
            const first = mDoc[1].split(',')[0].trim(); // primo docente
            const t = parseDocente(first);
            if (t) {
                if (!teachers.has(t.email)) teachers.set(t.email, t);
                const d = degrees.get(pendingCourse.dk);
                const ck = `${pendingCourse.courseName}||${pendingCourse.dk}`;
                if (!courses.has(ck)) {
                    courses.set(ck, {
                        courseName: pendingCourse.courseName,
                        teacherEmail: t.email,
                        degreeName: d.degreeName,
                        degreeType: d.degreeType,
                        degreeYear: d.degreeYear,
                    });
                }
            }
            flushPending();
            continue;
        }
    }
}

// ---- emit TS ----
const q = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const teacherLines = [...teachers.values()]
    .map((t) => `    { name: ${q(t.name)}, surname: ${q(t.surname)}, email: ${q(t.email)} },`)
    .join('\n');

const degreeLines = [...degrees.values()]
    .map((d) =>
        `    { degreeName: ${q(d.degreeName)}, degreeType: DegreeType.${d.degreeType}, degreeYear: DegreeYear.${d.degreeYear}, macroArea: MacroArea.${d.macroArea} },`
    )
    .join('\n');

// NB: usiamo una factory `mkCourse` invece di literal inline. Con ~2400 oggetti
// contenenti enum, TS proverebbe a costruire un'unica union di tutti i tipi
// literal e fallirebbe con TS2590 ("union type too complex"). Il valore di
// ritorno fisso `SeedCourse` collassa il tipo dell'elemento ed evita il problema.
const courseLines = [...courses.values()]
    .map((c) =>
        `    mkCourse(${q(c.courseName)}, ${q(c.teacherEmail)}, ${q(c.degreeName)}, DegreeType.${c.degreeType}, DegreeYear.${c.degreeYear}),`
    )
    .join('\n');

const out = `// FILE GENERATO AUTOMATICAMENTE da tools/parse-corsi.mjs — NON modificare a mano.
// Rigenera con: node tools/parse-corsi.mjs
import { DegreeType, DegreeYear, MacroArea } from '../entities/dto/degree.enum.js';

export interface SeedTeacher {
    name: string;
    surname: string;
    email: string;
}

export interface SeedDegree {
    degreeName: string;
    degreeType: DegreeType;
    degreeYear: DegreeYear;
    macroArea: MacroArea;
}

export interface SeedCourse {
    courseName: string;
    teacherEmail: string;
    degreeName: string;
    degreeType: DegreeType;
    degreeYear: DegreeYear;
}

export const seedTeachers: SeedTeacher[] = [
${teacherLines}
];

export const seedDegrees: SeedDegree[] = [
${degreeLines}
];

// Converte un nome corso da TUTTO MAIUSCOLO a "Solo iniziale maiuscola"
// (sentence case): prima lettera maiuscola, resto minuscolo. Gestisce accenti.
// I numeri romani standalone (I, II, III … XII) restano maiuscoli.
function toSentenceCase(name: string): string {
    const ROMAN = /^(I{1,3}|IV|VI{0,3}|IX|X[I]{0,3}|XII)$/;
    return name
        .toLowerCase()
        .replace(/\\p{L}/u, (ch) => ch.toUpperCase())
        .replace(/\\b[ivx]+\\b/g, (w) => (ROMAN.test(w.toUpperCase()) ? w.toUpperCase() : w));
}

function mkCourse(
    courseName: string,
    teacherEmail: string,
    degreeName: string,
    degreeType: DegreeType,
    degreeYear: DegreeYear,
): SeedCourse {
    return { courseName: toSentenceCase(courseName), teacherEmail, degreeName, degreeType, degreeYear };
}

export const seedCourses: SeedCourse[] = [
${courseLines}
];

// Normalizza i nomi dei corsi di laurea a "Solo iniziale maiuscola" su ENTRAMBI
// gli array: le definizioni dei degree e i riferimenti dentro i corsi. Stessa
// funzione su entrambi i lati => la chiave di join degreeName resta coerente.
for (const d of seedDegrees) d.degreeName = toSentenceCase(d.degreeName);
for (const c of seedCourses) c.degreeName = toSentenceCase(c.degreeName);
`;

writeFileSync(outFile, out, 'utf-8');
console.log(`teachers=${teachers.size} degrees=${degrees.size} courses=${courses.size}`);
console.log(`scritto ${outFile}`);
