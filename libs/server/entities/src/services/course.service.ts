import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CourseEntity } from '../entities/course.entity.js';
import { CourseRepository } from '../repositories/course.repository.js';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { DegreeRepository } from '../repositories/degree.repository.js';
import { CreateCourseDto } from '../entities/dto/create-course.dto.js';
import { UpdateCourseDto } from '../entities/dto/update-course.dto.js';
import { CourseListItem } from '../interfaces/course-list-item.js';

@Injectable()
export class ServerCourseService {
    constructor(
        private readonly courseRepository: CourseRepository,
        private readonly teacherRepository: TeacherRepository,
        private readonly degreeRepository: DegreeRepository,
    ) {}

    findDegreesByTeacher(teacherId: number) {
        return this.courseRepository.findDegreesByTeacher(teacherId);
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
            degrees: course.degrees.map(d => ({
                id: d.id,
                degreeName: d.degreeName,
                degreeType: d.degreeType,
                degreeYear: d.degreeYear,
                macroArea: d.macroArea,
            })),
        };
    }

    async create(dto: CreateCourseDto): Promise<CourseListItem> {
        const existing = await this.courseRepository.findByName(dto.courseName);
        if (existing) 
            throw new ConflictException(`Course name "${dto.courseName}" already exists`);

        const teacher = await this.teacherRepository.findById(dto.teacherId);
        if (!teacher) 
            throw new NotFoundException(`Teacher with id ${dto.teacherId} not found`);

        const degrees = dto.degreeIds?.length
            ? await this.degreeRepository.findByIds(dto.degreeIds)
            : [];

        const course = this.courseRepository.create({ courseName: dto.courseName, teacher, degrees });
        return this.toListItem(await this.courseRepository.save(course));
    }

    async update(id: number, dto: UpdateCourseDto): Promise<CourseListItem> {
        const course = await this.courseRepository.findByIdWithRelations(id);
        if (!course) 
            throw new NotFoundException(`Course with id ${id} not found`);

        if (dto.courseName !== undefined) {
            const conflict = await this.courseRepository.findByName(dto.courseName);
            if (conflict && conflict.id !== id)
                throw new ConflictException(`Course name "${dto.courseName}" already exists`);
            course.courseName = dto.courseName;
        }

        if (dto.teacherId !== undefined) {
            const teacher = await this.teacherRepository.findById(dto.teacherId);
            if (!teacher) 
                throw new NotFoundException(`Teacher with id ${dto.teacherId} not found`);
            course.teacher = teacher;
        }

        if (dto.degreeIds !== undefined) {
            course.degrees = dto.degreeIds.length
                ? await this.degreeRepository.findByIds(dto.degreeIds)
                : [];
        }

        return this.toListItem(await this.courseRepository.save(course));
    }

    async remove(id: number): Promise<void> {
        try {
            const result = await this.courseRepository.delete(id);
            if ((result.affected ?? 0) === 0)
                throw new NotFoundException(`Course with id ${id} not found`);
        } catch (e) {
            if (e instanceof NotFoundException) throw e;
            throw new ConflictException('Cannot delete course: it is referenced by one or more exams');
        }
    }

    async seed(): Promise<void> {
        const teachers = await this.teacherRepository.findAll();
        if (teachers.length === 0)
            throw new Error('No teachers found');

        const degrees = await this.degreeRepository.findAll();
        if (degrees.length === 0)
            throw new Error('No degrees found');

        const [t1, t2, t3] = teachers;
        const d = degrees;

        const courses: { courseName: string; teacher: (typeof teachers)[0]; degreeIds: number[] }[] = [
            { courseName: 'Algebra e Geometria',                    teacher: t1, degreeIds: [d[0]?.id, d[5]?.id].filter(Boolean) as number[] },
            { courseName: 'Algebra per Codici e Crittografia',      teacher: t1, degreeIds: [d[4]?.id, d[2]?.id].filter(Boolean) as number[] },
            { courseName: 'Elementi di Informatica e Programmazione', teacher: t3, degreeIds: [d[0]?.id, d[5]?.id].filter(Boolean) as number[] },
            { courseName: 'Ingegneria del Software',                teacher: t3, degreeIds: [d[2]?.id].filter(Boolean) as number[] },
            { courseName: 'Analisi Matematica 1',                   teacher: t2, degreeIds: [d[0]?.id, d[5]?.id].filter(Boolean) as number[] },
            { courseName: 'Calcolo Scientifico',                    teacher: t2, degreeIds: [d[3]?.id].filter(Boolean) as number[] },
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
