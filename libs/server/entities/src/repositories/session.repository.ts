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
