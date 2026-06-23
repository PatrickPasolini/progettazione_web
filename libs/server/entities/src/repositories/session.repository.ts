import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { SessionEntity } from '../entities/session.entity.js';
import { CourseEntity } from '../entities/course.entity.js';

@Injectable()
export class SessionRepository {
    constructor(
        @InjectRepository(SessionEntity)
        private readonly repo: Repository<SessionEntity>,
    ) {}

    findAll(): Promise<SessionEntity[]> {
        return this.repo.find({ order: { id: 'ASC' } });
    }

    findById(id: number): Promise<SessionEntity | null> {
        return this.repo.findOne({ where: { id } });
    }

    findByIdWithDegrees(id: number): Promise<SessionEntity | null> {
        return this.repo.findOne({ where: { id }, relations: ['degrees'] });
    }

    // Restituisce le sessioni non terminate che contengono corsi insegnati dal teacher
    findActiveByTeacher(teacherId: number): Promise<SessionEntity[]> {
        const today = new Date().toISOString().slice(0, 10);
        return this.repo
            .createQueryBuilder('session')
            .innerJoin('session.degrees', 'degree')
            .innerJoin(
                CourseEntity,
                'course',
                'course.degreeId = degree.id AND course.teacherId = :teacherId',
                { teacherId },
            )
            .andWhere('session.endDate >= :today', { today })
            .distinct(true)
            .orderBy('session.startDate', 'ASC')
            .getMany();
    }

    create(data: Partial<SessionEntity>): SessionEntity {
        return this.repo.create(data);
    }

    save(session: SessionEntity): Promise<SessionEntity> {
        return this.repo.save(session);
    }

    delete(id: number): Promise<DeleteResult> {
        return this.repo.delete(id);
    }

    // Svuota la tabella session. CASCADE pulisce exam e il join session_degrees.
    async clearCascade(): Promise<void> {
        await this.repo.query('TRUNCATE TABLE "session" RESTART IDENTITY CASCADE');
    }
}
