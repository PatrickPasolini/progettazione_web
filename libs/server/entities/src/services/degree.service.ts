import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DegreeRepository } from '../repositories/degree.repository.js';
import { CreateDegreeDto } from '../entities/dto/create-degree.dto.js';
import { UpdateDegreeDto } from '../entities/dto/update-degree.dto.js';
import { DegreeListItem } from '../interfaces/degree-list-item.js';
import { seedDegrees } from '../assets/courses-data.js';

@Injectable()
export class ServerDegreeService {
    constructor(private readonly degreeRepository: DegreeRepository) {}

    findAll(): Promise<DegreeListItem[]> {
        return this.degreeRepository.findAll().then((degrees) => degrees.map(this.toListItem));
    }

    async findOne(id: number): Promise<DegreeListItem> {
        const degree = await this.degreeRepository.findById(id);
        if (!degree) throw new NotFoundException(`Degree with id ${id} not found`);
        return this.toListItem(degree);
    }

    async create(dto: CreateDegreeDto): Promise<DegreeListItem> {
        const exists = await this.degreeRepository.findByNameTypeYear(
            dto.degreeName,
            dto.degreeType,
            dto.degreeYear,
        );
        if (exists) throw new ConflictException('Degree with this name, type and year already exists');

        const degree = this.degreeRepository.create(dto);
        const saved = await this.degreeRepository.save(degree);
        return this.toListItem(saved);
    }

    async update(id: number, dto: UpdateDegreeDto): Promise<DegreeListItem> {
        const degree = await this.degreeRepository.findById(id);
        if (!degree) throw new NotFoundException(`Degree with id ${id} not found`);

        const newName      = dto.degreeName  ?? degree.degreeName;
        const newType      = dto.degreeType  ?? degree.degreeType;
        const newYear      = dto.degreeYear  ?? degree.degreeYear;
        const newMacroArea = dto.macroArea   ?? degree.macroArea;

        if (newName !== degree.degreeName || newType !== degree.degreeType || newYear !== degree.degreeYear) {
            const conflict = await this.degreeRepository.findByNameTypeYear(newName, newType, newYear);
            if (conflict && conflict.id !== id) {
                throw new ConflictException('Degree with this name, type and year already exists');
            }
        }

        Object.assign(degree, { degreeName: newName, degreeType: newType, degreeYear: newYear, macroArea: newMacroArea });
        const saved = await this.degreeRepository.save(degree);
        return this.toListItem(saved);
    }

    private toListItem(degree: DegreeEntity): DegreeListItem {
        return {
            id: degree.id,
            degreeName: degree.degreeName,
            degreeType: degree.degreeType,
            degreeYear: degree.degreeYear,
            macroArea: degree.macroArea,
        };
    }

    async remove(id: number): Promise<void> {
        const degree = await this.degreeRepository.findByIdWithSessions(id);
        if (!degree) throw new NotFoundException(`Degree with id ${id} not found`);

        if (await this.degreeRepository.hasCourses(id))
            throw new ConflictException('Non puoi eliminare questo corso di laurea perché ha delle materie associate!');

        if (degree.sessions?.length) {
            degree.sessions = [];
            await this.degreeRepository.save(degree);
        }

        await this.degreeRepository.delete(id);
    }

    async seed(): Promise<void> {
        // Reset: svuota i corsi di laurea (e course/exam/join dipendenti).
        await this.degreeRepository.clearCascade();

        const existing = await this.degreeRepository.findAll();
        const seen = new Set(
            existing.map((d) => `${d.degreeName}||${d.degreeType}||${d.degreeYear}`),
        );

        for (const d of seedDegrees) {
            const key = `${d.degreeName}||${d.degreeType}||${d.degreeYear}`;
            if (seen.has(key)) continue;
            seen.add(key);

            const degree = this.degreeRepository.create(d);
            await this.degreeRepository.save(degree);
        }
    }
}
