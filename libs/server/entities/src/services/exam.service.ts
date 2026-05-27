import {BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import { ExamEntity } from '../entities/exam.entity.js';
import { ExamRepository } from '../repositories/exam.repository.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { CourseRepository } from '../repositories/course.repository.js';
import { DegreeRepository } from '../repositories/degree.repository.js';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { CreateExamDto } from '../entities/dto/create-exam.dto.js';
import { UpdateExamDto } from '../entities/dto/update-exam.dto.js';
import { TeacherEntity } from '../entities/teacher.entity.js';
import { UserRole } from '@server/users';
import { ExamListItem } from '../interfaces/exam-list-item.js';

@Injectable()
export class ServerExamService {
    constructor(
        private readonly examRepository: ExamRepository,
        private readonly sessionRepository: SessionRepository,
        private readonly courseRepository: CourseRepository,
        private readonly degreeRepository: DegreeRepository,
        private readonly teacherRepository: TeacherRepository,
    ) {}

    async findAll(sessionId?: number, degreeId?: number, teacherId?: number): Promise<ExamListItem[]> {
        const exams = await this.examRepository.findAll(sessionId, degreeId, teacherId);
        return exams.map(e => this.toListItem(e));
    }

    async findOne(id: number): Promise<ExamListItem> {
        const exam = await this.examRepository.findById(id);
        if (!exam) throw new NotFoundException(`Exam with id ${id} not found`);
        return this.toListItem(exam);
    }

    async create(dto: CreateExamDto, currentTeacher: TeacherEntity): Promise<ExamListItem> {
        const session = await this.sessionRepository.findById(dto.sessionId);
        if (!session) throw new NotFoundException(`Session with id ${dto.sessionId} not found`);

        const course = await this.courseRepository.findById(dto.courseId);
        if (!course) throw new NotFoundException(`Course with id ${dto.courseId} not found`);
        if (course.teacher.id !== currentTeacher.id)
            throw new ForbiddenException('You can only schedule exams for your own courses');

        const degree = await this.degreeRepository.findById(dto.degreeId);
        if (!degree) throw new NotFoundException(`Degree with id ${dto.degreeId} not found`);

        const degreeInSession = degree.macroArea === session.macroArea;
        if (!degreeInSession) {
            throw new BadRequestException(`Degree ${degree.id} does not belong to session ${session.id}`);
        }

        const courseInDegree = course.degrees?.some((d) => d.id === degree.id);
        if (!courseInDegree) {
            throw new BadRequestException(`Course ${course.id} is not available for degree ${degree.id}`);
        }

        const examDate = new Date(dto.examDate);
        this.validateExamDate(examDate, session.startDate, session.endDate);
        this.validateInsertionWindow(session.startInsertDate, session.endInsertDate);

        const conflict = await this.examRepository.findBySessionDegreeDate(
            session.id,
            degree.id,
            dto.examDate,
        );
        if (conflict) {
            throw new ConflictException(
                `An exam is already scheduled on ${dto.examDate} for this degree and session`,
            );
        }

        const teacher = await this.teacherRepository.findById(currentTeacher.id);
        if (!teacher) throw new NotFoundException(`Teacher with id ${currentTeacher.id} not found`);

        const exam = this.examRepository.create({
            examDate: examDate,
            startTime: new Date(dto.startTime),
            endTime: new Date(dto.endTime),
            course,
            session,
            teacher,
            degree,
        });

        return this.toListItem(await this.examRepository.save(exam));
    }

    async update(id: number, dto: UpdateExamDto, currentTeacher: TeacherEntity): Promise<ExamListItem> {
        const exam = await this.examRepository.findById(id);
        if (!exam) throw new NotFoundException(`Exam with id ${id} not found`);

        if (exam.teacher.id !== currentTeacher.id) {
            throw new ForbiddenException('You can only modify your own exams');
        }

        this.validateInsertionWindow(exam.session.startInsertDate, exam.session.endInsertDate);

        if (dto.courseId) {
            const course = await this.courseRepository.findById(dto.courseId);
            if (!course) throw new NotFoundException(`Course with id ${dto.courseId} not found`);
            if (course.teacher.id !== currentTeacher.id)
                throw new ForbiddenException('You can only schedule exams for your own courses');
            exam.course = course;
        }

        if (dto.degreeId) {
            const degree = await this.degreeRepository.findById(dto.degreeId);
            if (!degree) throw new NotFoundException(`Degree with id ${dto.degreeId} not found`);
            const degreeInSession = exam.session.degrees?.some((d) => d.id === degree.id);
            if (!degreeInSession) {
                throw new BadRequestException(`Degree ${degree.id} does not belong to this session`);
            }
            exam.degree = degree;
        }

        const courseInDegree = exam.course.degrees?.some((d) => d.id === exam.degree.id);
        if (!courseInDegree) {
            throw new BadRequestException(`Course ${exam.course.id} is not available for degree ${exam.degree.id}`);
        }

        if (dto.examDate) {
            const newDate = new Date(dto.examDate);
            this.validateExamDate(newDate, exam.session.startDate, exam.session.endDate);

            const conflict = await this.examRepository.findBySessionDegreeDate(
                exam.session.id,
                exam.degree.id,
                dto.examDate,
            );
            if (conflict && conflict.id !== id) {
                throw new ConflictException(
                    `An exam is already scheduled on ${dto.examDate} for this degree and session`,
                );
            }

            exam.examDate = newDate;
        }

        if (dto.startTime) exam.startTime = new Date(dto.startTime);
        if (dto.endTime) exam.endTime = new Date(dto.endTime);

        return this.toListItem(await this.examRepository.save(exam));
    }

    async remove(id: number, currentTeacher: TeacherEntity): Promise<void> {
        const exam = await this.examRepository.findById(id);
        if (!exam) throw new NotFoundException(`Exam with id ${id} not found`);

        const isAdminOrSecretary =
            currentTeacher.role === UserRole.ADMIN || currentTeacher.role === UserRole.SECRETARY;

        if (!isAdminOrSecretary && exam.teacher.id !== currentTeacher.id) {
            throw new ForbiddenException('You can only delete your own exams');
        }

        if (!isAdminOrSecretary) {
            this.validateInsertionWindow(exam.session.startInsertDate, exam.session.endInsertDate);
        }

        await this.examRepository.delete(id);
    }

    async seed(): Promise<void> {
        const sessions = await this.sessionRepository.findAll();
        if (sessions.length === 0)
            throw new Error('No sessions found');

        const teachers = await this.teacherRepository.findAll();
        if (teachers.length === 0)
            throw new Error('No teachers found');

        const courses = await this.courseRepository.findAll();
        if (courses.length === 0)
            throw new Error('No courses found');

        const degrees = await this.degreeRepository.findAll();
        if (degrees.length === 0)
            throw new Error('No degrees found');

        const [session] = sessions;
        const [t1, t2, t3] = teachers; // Giuzzi, Gervasio, Saetti

        const exams = [
            {
                // Giuzzi — Algebra e Geometria — Info BACHELOR 1°
                examDate:  new Date('2026-06-10'),
                startTime: new Date('2026-06-10T09:00:00'),
                endTime:   new Date('2026-06-10T11:00:00'),
                teacher:   t1,
                course:    courses[0],
                degree:    degrees[0],
                session,
            },
            {
                // Gervasio — Analisi Matematica 1 — Info BACHELOR 1°
                examDate:  new Date('2026-06-12'),
                startTime: new Date('2026-06-12T09:00:00'),
                endTime:   new Date('2026-06-12T11:00:00'),
                teacher:   t2,
                course:    courses[4],
                degree:    degrees[0],
                session,
            },
            {
                // Saetti — Elementi di Informatica e Programmazione — Info BACHELOR 1°
                examDate:  new Date('2026-06-16'),
                startTime: new Date('2026-06-16T09:00:00'),
                endTime:   new Date('2026-06-16T11:00:00'),
                teacher:   t3,
                course:    courses[2],
                degree:    degrees[0],
                session,
            },
        ];

        for (const e of exams) {
            const conflict = await this.examRepository.findBySessionDegreeDate(
                session.id,
                e.degree.id,
                e.examDate.toISOString().slice(0, 10),
            );
            if (conflict) continue;

            const exam = this.examRepository.create(e);
            await this.examRepository.save(exam);
        }
    }

    private toListItem(exam: ExamEntity): ExamListItem {
        return {
            id: exam.id,
            examDate: exam.examDate,
            startTime: exam.startTime,
            endTime: exam.endTime,
            course: {
                id: exam.course.id,
                courseName: exam.course.courseName,
            },
            session: {
                id: exam.session.id,
                startDate: exam.session.startDate,
                endDate: exam.session.endDate,
                startInsertDate: exam.session.startInsertDate,
                endInsertDate: exam.session.endInsertDate,
            },
            teacher: {
                id: exam.teacher.id,
                name: exam.teacher.name,
                surname: exam.teacher.surname,
                email: exam.teacher.email,
                role: exam.teacher.role,
            },
            degree: {
                id: exam.degree.id,
                degreeName: exam.degree.degreeName,
                degreeType: exam.degree.degreeType,
                degreeYear: exam.degree.degreeYear,
                macroArea: exam.degree.macroArea,
            },
        };
    }

    private validateExamDate(examDate: Date, sessionStart: Date, sessionEnd: Date): void {
        const day = examDate.getDay();
        if (day === 0 || day === 6) {
            throw new BadRequestException('Exam cannot be scheduled on a Saturday or Sunday');
        }
        if (examDate < sessionStart || examDate > sessionEnd) {
            throw new BadRequestException('Exam date must be within the session period');
        }
    }

    private validateInsertionWindow(insertStart: Date, insertEnd: Date): void {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (today < insertStart || today > insertEnd) {
            throw new ForbiddenException('Exam bookings can only be modified within the insertion window');
        }
    }
}
