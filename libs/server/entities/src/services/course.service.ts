import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CourseEntity } from '../entities/course.entity.js';
import { CourseRepository } from '../repositories/course.repository.js';
import { ExamRepository } from '../repositories/exam.repository.js';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { DegreeRepository } from '../repositories/degree.repository.js';
import { CreateCourseDto } from '../entities/dto/create-course.dto.js';
import { UpdateCourseDto } from '../entities/dto/update-course.dto.js';
import { CourseListItem } from '../interfaces/course-list-item.js';
import { seedCourses } from '../assets/courses-data.js';

@Injectable()
export class ServerCourseService {
    constructor(
        private readonly courseRepository: CourseRepository,
        private readonly examRepository: ExamRepository,
        private readonly teacherRepository: TeacherRepository,
        private readonly degreeRepository: DegreeRepository,
    ) {}

    async findByTeacherAndSession(teacherId: number, sessionId: number): Promise<CourseListItem[]> {
        const courses = await this.courseRepository.findByTeacherAndSession(teacherId, sessionId);
        return courses.map(c => this.toListItem(c));
    }

    async findDegreesByTeacher(teacherId: number) {
        const courses = await this.courseRepository.findAll(teacherId);
        const map = new Map<number, (typeof courses)[0]['degree']>();
        for (const course of courses) {
            map.set(course.degree.id, course.degree);
        }
        return [...map.values()];
    }

    async findAll(teacherId?: number): Promise<CourseListItem[]> {
        const courses = await this.courseRepository.findAll(teacherId);
        return courses.map(c => this.toListItem(c));
    }

    async findOne(id: number): Promise<CourseListItem> {
        const course = await this.courseRepository.findById(id);
        if (!course) 
            throw new NotFoundException(`Course with id ${id} not found`);
        return this.toListItem(course);
    }

    private toListItem(course: CourseEntity): CourseListItem {
        return {
            id: course.id,
            courseName: course.courseName,
            teacher: {
                id: course.teacher.id,
                name: course.teacher.name,
                surname: course.teacher.surname,
                email: course.teacher.email,
                role: course.teacher.role,
            },
            degree: {
                id: course.degree.id,
                degreeName: course.degree.degreeName,
                degreeType: course.degree.degreeType,
                degreeYear: course.degree.degreeYear,
                macroArea: course.degree.macroArea,
            },
        };
    }

    async create(dto: CreateCourseDto): Promise<CourseListItem> {
        const teacher = await this.teacherRepository.findById(dto.teacherId);
        if (!teacher) 
            throw new NotFoundException(`Teacher with id ${dto.teacherId} not found`);

        const degree = await this.degreeRepository.findById(dto.degreeId);
        if (!degree) 
            throw new NotFoundException(`Degree with id ${dto.degreeId} not found`);

        const existing = await this.courseRepository.findByNameAndDegree(dto.courseName, dto.degreeId);
        if (existing) {
            throw new ConflictException(
                `A course named "${dto.courseName}" already exists for this degree`
            );
        }

        const course = this.courseRepository.create({ courseName: dto.courseName, teacher, degree });
        return this.toListItem(await this.courseRepository.save(course));
    }

    async update(id: number, dto: UpdateCourseDto): Promise<CourseListItem> {
        const course = await this.courseRepository.findByIdWithRelations(id);
        if (!course) 
            throw new NotFoundException(`Course with id ${id} not found`);

        if (dto.courseName !== undefined) {
            course.courseName = dto.courseName;
        }

        if (dto.teacherId !== undefined) {
            const teacher = await this.teacherRepository.findById(dto.teacherId);
            if (!teacher) 
                throw new NotFoundException(`Teacher with id ${dto.teacherId} not found`);
            course.teacher = teacher;
        }

        if (dto.degreeId !== undefined) {
            const degree = await this.degreeRepository.findById(dto.degreeId);
            if (!degree) 
                throw new NotFoundException(`Degree with id ${dto.degreeId} not found`);
            course.degree = degree;
        }

        const conflict = await this.courseRepository.findByNameAndDegree(
            course.courseName,
            course.degree.id
        );
        if (conflict && conflict.id !== id) {
            throw new ConflictException(
                `A course named "${course.courseName}" already exists for this degree`
            );
        }

        return this.toListItem(await this.courseRepository.save(course));
    }

    async remove(id: number): Promise<void> {
        const course = await this.courseRepository.findById(id);
        if (!course) throw new NotFoundException(`Course with id ${id} not found`);

        const upcoming = await this.courseRepository.countUpcomingExams(id);
        if (upcoming > 0)
            throw new ConflictException('Non puoi eliminare questa materia perché ha degli esami futuri programmati.');

        await this.examRepository.deletePastByCourse(id);
        await this.courseRepository.delete(id);
    }

    async seed(): Promise<void> {
        const teachers = await this.teacherRepository.findAll();
        if (teachers.length === 0)
            throw new Error('No teachers found - esegui prima il seed dei docenti');

        const degrees = await this.degreeRepository.findAll();
        if (degrees.length === 0)
            throw new Error('No degrees found - esegui prima il seed dei corsi di laurea');

        // Reset: svuota i corsi (e exam dipendenti) per un seed pulito.
        await this.courseRepository.clearCascade();

        // Indici in memoria per evitare una query per riga (~2400 corsi).
        const teacherByEmail = new Map(teachers.map((t) => [t.email, t]));
        const degreeByKey = new Map(
            degrees.map((d) => [`${d.degreeName}||${d.degreeType}||${d.degreeYear}`, d]),
        );
        const existing = await this.courseRepository.findAll();
        const seen = new Set(existing.map((c) => `${c.courseName}||${c.degree.id}`));

        for (const c of seedCourses) {
            const teacher = teacherByEmail.get(c.teacherEmail);
            const degree = degreeByKey.get(`${c.degreeName}||${c.degreeType}||${c.degreeYear}`);
            if (!teacher || !degree) continue;

            const key = `${c.courseName}||${degree.id}`;
            if (seen.has(key)) continue;
            seen.add(key);

            const course = this.courseRepository.create({
                courseName: c.courseName,
                teacher,
                degree,
            });
            await this.courseRepository.save(course);
        }
    }
}
