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

    // Restituisce le sessioni con finestra d'inserimento attiva
    // per le macro-aree in cui il docente insegna
    findActiveByTeacher(teacherId: number): Promise<SessionEntity[]> {
        const today = new Date().toISOString().slice(0, 10);
        return this.repo
            .createQueryBuilder('session')
            .innerJoin('session.degrees', 'degree')
            .where(
                `degree.id IN (SELECT c."degreeId" FROM course c WHERE c."teacherId" = :teacherId)`,
                { teacherId },
            )
            .andWhere('session.startInsertDate <= :today', { today })
            .andWhere('session.endInsertDate >= :today', { today })
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
