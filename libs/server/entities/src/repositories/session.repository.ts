import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { SessionEntity } from '../entities/session.entity.js';

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

    // Restituisce le sessioni non terminate in cui il Teacher ha exam associati 
    findActiveByTeacher(teacherId: number): Promise<SessionEntity[]> {
        const today = new Date().toISOString().slice(0, 10);
        return this.repo
            .createQueryBuilder('session')
            .innerJoin('session.exams', 'exam')
            .innerJoin('exam.teacher', 'teacher')
            .where('teacher.id = :teacherId', { teacherId })
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
}
