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

        const [t1, t2, t3, t4] = teachers;
        const d = degrees;

        const courses: { courseName: string; teacher: (typeof teachers)[0]; degreeId: number }[] = [
            { courseName: 'Algebra e Geometria',                    teacher: t1, degreeId: d[0]?.id },
            { courseName: 'Algebra e Geometria',                    teacher: t1, degreeId: d[5]?.id },
            { courseName: 'Algebra per Codici e Crittografia',      teacher: t1, degreeId: d[4]?.id },
            { courseName: 'Algebra per Codici e Crittografia',      teacher: t1, degreeId: d[2]?.id },
            { courseName: 'Elementi di Informatica e Programmazione', teacher: t3, degreeId: d[0]?.id },
            { courseName: 'Elementi di Informatica e Programmazione', teacher: t3, degreeId: d[5]?.id },
            { courseName: 'Ingegneria del Software',                teacher: t3, degreeId: d[2]?.id },
            { courseName: 'Analisi Matematica 1',                   teacher: t2, degreeId: d[0]?.id },
            { courseName: 'Analisi Matematica 1',                   teacher: t2, degreeId: d[5]?.id },
            { courseName: 'Calcolo Scientifico',                    teacher: t2, degreeId: d[3]?.id },
            // Economics courses (indices 10-17 after Engineering)
            { courseName: 'Economia Politica',                      teacher: t4, degreeId: d[10]?.id },
            { courseName: 'Economia Politica',                      teacher: t4, degreeId: d[11]?.id },
            { courseName: 'Economia Politica',                      teacher: t4, degreeId: d[12]?.id },
            { courseName: 'Economia Politica',                      teacher: t4, degreeId: d[13]?.id },
            { courseName: 'Economia Politica',                      teacher: t4, degreeId: d[14]?.id },
            { courseName: 'Economia Politica',                      teacher: t4, degreeId: d[15]?.id },
            { courseName: 'Economia Politica',                      teacher: t4, degreeId: d[16]?.id },
            { courseName: 'Economia Politica',                      teacher: t4, degreeId: d[17]?.id },
            { courseName: 'Ragioneria Generale',                    teacher: t4, degreeId: d[10]?.id },
            { courseName: 'Ragioneria Generale',                    teacher: t4, degreeId: d[11]?.id },
            { courseName: 'Ragioneria Generale',                    teacher: t4, degreeId: d[13]?.id },
            { courseName: 'Ragioneria Generale',                    teacher: t4, degreeId: d[14]?.id },
            { courseName: 'Statistica',                             teacher: t4, degreeId: d[10]?.id },
            { courseName: 'Statistica',                             teacher: t4, degreeId: d[11]?.id },
            { courseName: 'Statistica',                             teacher: t4, degreeId: d[12]?.id },
            { courseName: 'Statistica',                             teacher: t4, degreeId: d[16]?.id },
            { courseName: 'Statistica',                             teacher: t4, degreeId: d[17]?.id },
            { courseName: 'Diritto Commerciale',                    teacher: t4, degreeId: d[13]?.id },
            { courseName: 'Diritto Commerciale',                    teacher: t4, degreeId: d[14]?.id },
        ];

        for (const c of courses) {
            if (!c.degreeId) continue;

            const exists = await this.courseRepository.findByNameAndDegree(c.courseName, c.degreeId);
            if (exists) continue;

            const degree = await this.degreeRepository.findById(c.degreeId);
            if (!degree) continue;

            const course = this.courseRepository.create({
                courseName: c.courseName,
                teacher: c.teacher,
                degree,
            });
            await this.courseRepository.save(course);
        }
    }
}
