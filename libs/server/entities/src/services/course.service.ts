import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CourseEntity } from '../entities/course.entity.js';
import { CourseRepository } from '../repositories/course.repository.js';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { DegreeRepository } from '../repositories/degree.repository.js';
import { CreateCourseDto } from '../dto/create-course.dto.js';
import { UpdateCourseDto } from '../dto/update-course.dto.js';

@Injectable()
export class ServerCourseService {
    constructor(
        private readonly courseRepository: CourseRepository,
        private readonly teacherRepository: TeacherRepository,
        private readonly degreeRepository: DegreeRepository,
    ) {}

    findAll(teacherId?: number): Promise<CourseEntity[]> {
        return this.courseRepository.findAll(teacherId);
    }

    async findOne(id: number): Promise<CourseEntity> {
        const course = await this.courseRepository.findById(id);
        if (!course) throw new NotFoundException(`Course with id ${id} not found`);
        return course;
    }

    async create(dto: CreateCourseDto): Promise<CourseEntity> {
        const existing = await this.courseRepository.findByName(dto.courseName);
        if (existing) throw new ConflictException(`Course name "${dto.courseName}" already exists`);

        const teacher = await this.teacherRepository.findById(dto.teacherId);
        if (!teacher) throw new NotFoundException(`Teacher with id ${dto.teacherId} not found`);

        const degrees = dto.degreeIds?.length
            ? await this.degreeRepository.findByIds(dto.degreeIds)
            : [];

        const course = this.courseRepository.create({ courseName: dto.courseName, teacher, degrees });
        return this.courseRepository.save(course);
    }

    async update(id: number, dto: UpdateCourseDto): Promise<CourseEntity> {
        const course = await this.courseRepository.findByIdWithRelations(id);
        if (!course) throw new NotFoundException(`Course with id ${id} not found`);

        if (dto.courseName !== undefined) {
            const conflict = await this.courseRepository.findByName(dto.courseName);
            if (conflict && conflict.id !== id)
                throw new ConflictException(`Course name "${dto.courseName}" already exists`);
            course.courseName = dto.courseName;
        }

        if (dto.teacherId !== undefined) {
            const teacher = await this.teacherRepository.findById(dto.teacherId);
            if (!teacher) throw new NotFoundException(`Teacher with id ${dto.teacherId} not found`);
            course.teacher = teacher;
        }

        if (dto.degreeIds !== undefined) {
            course.degrees = dto.degreeIds.length
                ? await this.degreeRepository.findByIds(dto.degreeIds)
                : [];
        }

        return this.courseRepository.save(course);
    }

    async remove(id: number): Promise<void> {
        const result = await this.courseRepository.delete(id);
        if ((result.affected ?? 0) === 0)
            throw new NotFoundException(`Course with id ${id} not found`);
    }

    async seed(): Promise<void> {
        const teachers = await this.teacherRepository.findAll();
        if (teachers.length === 0)
            throw new Error('No teachers found — run POST /teacher/populate first');

        const degrees = await this.degreeRepository.findAll();
        if (degrees.length === 0)
            throw new Error('No degrees found — run POST /degree/populate first');

        const [t1, t2, t3] = teachers;
        const d = degrees;

        const courses: { courseName: string; teacher: (typeof teachers)[0]; degreeIds: number[] }[] = [
            { courseName: 'Analisi Matematica I',       teacher: t1,       degreeIds: [d[0]?.id, d[3]?.id].filter(Boolean) as number[] },
            { courseName: 'Analisi Matematica II',      teacher: t1,       degreeIds: [d[1]?.id, d[4]?.id].filter(Boolean) as number[] },
            { courseName: 'Programmazione I',           teacher: t2,       degreeIds: [d[0]?.id].filter(Boolean) as number[] },
            { courseName: 'Programmazione II',          teacher: t2,       degreeIds: [d[1]?.id].filter(Boolean) as number[] },
            { courseName: 'Basi di Dati',               teacher: t3 ?? t1, degreeIds: [d[2]?.id, d[5]?.id].filter(Boolean) as number[] },
            { courseName: 'Reti di Calcolatori',        teacher: t3 ?? t2, degreeIds: [d[2]?.id].filter(Boolean) as number[] },
            { courseName: 'Algoritmi e Strutture Dati', teacher: t2,       degreeIds: [d[1]?.id, d[4]?.id].filter(Boolean) as number[] },
            { courseName: 'Sistemi Operativi',          teacher: t1,       degreeIds: [d[2]?.id, d[5]?.id].filter(Boolean) as number[] },
        ];

        for (const c of courses) {
            const exists = await this.courseRepository.findByName(c.courseName);
            if (exists) continue;

            const degreeEntities = c.degreeIds.length
                ? await this.degreeRepository.findByIds(c.degreeIds)
                : [];

            const course = this.courseRepository.create({
                courseName: c.courseName,
                teacher: c.teacher,
                degrees: degreeEntities,
            });
            await this.courseRepository.save(course);
        }
    }
}
