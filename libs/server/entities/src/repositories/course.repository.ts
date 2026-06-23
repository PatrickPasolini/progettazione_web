import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { CourseEntity } from '../entities/course.entity.js';

@Injectable()
export class CourseRepository {
    constructor(
        @InjectRepository(CourseEntity)
        private readonly repo: Repository<CourseEntity>,
    ) {}

    findAll(teacherId?: number): Promise<CourseEntity[]> {
        if (teacherId) {
            return this.repo.find({
                where: { teacher: { id: teacherId } },
                order: { id: 'ASC' },
            });
        }
        return this.repo.find({ order: { id: 'ASC' } });
    }

    findById(id: number): Promise<CourseEntity | null> {
        return this.repo.findOne({ where: { id }, relations: ['teacher', 'degree'] });
    }

    findByIdWithRelations(id: number): Promise<CourseEntity | null> {
        return this.repo.findOne({ where: { id }, relations: ['teacher', 'degree'] });
    }

    findByNameAndDegree(courseName: string, degreeId: number): Promise<CourseEntity | null> {
        return this.repo.findOne({ where: { courseName, degree: { id: degreeId } } });
    }

    findByTeacherAndSession(teacherId: number, sessionId: number): Promise<CourseEntity[]> {
        return this.repo.createQueryBuilder('course')
            .innerJoinAndSelect('course.teacher', 'teacher')
            .innerJoinAndSelect('course.degree', 'degree')
            .innerJoin('degree.sessions', 'session')
            .where('teacher.id = :teacherId', { teacherId })
            .andWhere('session.id = :sessionId', { sessionId })
            .orderBy('course.id', 'ASC')
            .getMany();
    }

    create(data: Partial<CourseEntity>): CourseEntity {
        return this.repo.create(data);
    }

    save(course: CourseEntity): Promise<CourseEntity> {
        return this.repo.save(course);
    }

    async delete(id: number): Promise<DeleteResult> {
        return this.repo.delete(id);
    }

    // Svuota la tabella course. CASCADE pulisce anche exam (exam.course RESTRICT).
    async clearCascade(): Promise<void> {
        await this.repo.query('TRUNCATE TABLE "course" RESTART IDENTITY CASCADE');
    }
}
