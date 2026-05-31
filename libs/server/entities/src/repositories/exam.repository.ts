import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ExamEntity } from '../entities/exam.entity.js';

@Injectable()
export class ExamRepository {
    constructor(
        @InjectRepository(ExamEntity)
        private readonly repo: Repository<ExamEntity>,
    ) {}

    findAll(sessionId?: number, degreeId?: number, teacherId?: number): Promise<ExamEntity[]> {
        const qb = this.repo.createQueryBuilder('exam')
            .leftJoinAndSelect('exam.course', 'course')
            .leftJoinAndSelect('exam.session', 'session')
            .leftJoinAndSelect('exam.teacher', 'teacher')
            .leftJoinAndSelect('exam.degree', 'degree')
            .orderBy('exam.examDate', 'ASC');

        if (sessionId) qb.andWhere('session.id = :sessionId', { sessionId });
        if (degreeId) qb.andWhere('degree.id = :degreeId', { degreeId });
        if (teacherId) qb.andWhere('teacher.id = :teacherId', { teacherId });

        return qb.getMany();
    }

    findById(id: number): Promise<ExamEntity | null> {
        return this.repo.findOne({ where: { id }, relations: ['course.degree'] });
    }

    findBySessionDegreeDate(
        sessionId: number,
        degreeId: number,
        examDate: string,
    ): Promise<ExamEntity | null> {
        return this.repo
            .createQueryBuilder('exam')
            .leftJoin('exam.session', 'session')
            .leftJoin('exam.degree', 'degree')
            .where('session.id = :sessionId', { sessionId })
            .andWhere('degree.id = :degreeId', { degreeId })
            .andWhere('exam.examDate = :examDate', { examDate })
            .getOne();
    }

    create(data: Partial<ExamEntity>): ExamEntity {
        return this.repo.create(data);
    }

    save(exam: ExamEntity): Promise<ExamEntity> {
        return this.repo.save(exam);
    }

    delete(id: number): Promise<DeleteResult> {
        return this.repo.delete(id);
    }
}
