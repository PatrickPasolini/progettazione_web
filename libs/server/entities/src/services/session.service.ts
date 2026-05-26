import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SessionEntity } from '../entities/session.entity.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { DegreeRepository } from '../repositories/degree.repository.js';
import { CreateSessionDto } from '../entities/dto/create-session.dto.js';
import { UpdateSessionDto } from '../entities/dto/update-session.dto.js';

@Injectable()
export class ServerSessionService {
    constructor(
        private readonly sessionRepository: SessionRepository,
        private readonly degreeRepository: DegreeRepository,
    ) {}

    findAll(): Promise<SessionEntity[]> {
        return this.sessionRepository.findAll();
    }

    async findOne(id: number): Promise<SessionEntity> {
        const session = await this.sessionRepository.findById(id);
        if (!session) throw new NotFoundException(`Session with id ${id} not found`);
        return session;
    }

    async create(dto: CreateSessionDto): Promise<SessionEntity> {
        this.validateDates(dto.startDate, dto.endDate, dto.startInsertDate, dto.endInsertDate);

        const session = this.sessionRepository.create({
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
            startInsertDate: new Date(dto.startInsertDate),
            endInsertDate: new Date(dto.endInsertDate),
        });

        if (dto.degreeIds?.length) {
            session.degrees = await this.degreeRepository.findByIds(dto.degreeIds);
        }

        return this.sessionRepository.save(session);
    }

    async update(id: number, dto: UpdateSessionDto): Promise<SessionEntity> {
        const session = await this.sessionRepository.findById(id);
        if (!session) throw new NotFoundException(`Session with id ${id} not found`);

        const startDate = dto.startDate ? new Date(dto.startDate) : session.startDate;
        const endDate = dto.endDate ? new Date(dto.endDate) : session.endDate;
        const startInsertDate = dto.startInsertDate ? new Date(dto.startInsertDate) : session.startInsertDate;
        const endInsertDate = dto.endInsertDate ? new Date(dto.endInsertDate) : session.endInsertDate;

        this.validateDates(
            startDate.toISOString().slice(0, 10),
            endDate.toISOString().slice(0, 10),
            startInsertDate.toISOString().slice(0, 10),
            endInsertDate.toISOString().slice(0, 10),
        );

        Object.assign(session, { startDate, endDate, startInsertDate, endInsertDate });

        if (dto.degreeIds !== undefined) {
            session.degrees = await this.degreeRepository.findByIds(dto.degreeIds);
        }

        return this.sessionRepository.save(session);
    }

    async remove(id: number): Promise<void> {
        const session = await this.sessionRepository.findById(id);
        if (!session) throw new NotFoundException(`Session with id ${id} not found`);
        await this.sessionRepository.delete(id);
    }

    private validateDates(
        startDate: string,
        endDate: string,
        startInsertDate: string,
        endInsertDate: string,
    ): void {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const insertStart = new Date(startInsertDate);
        const insertEnd = new Date(endInsertDate);

        if (start >= end) {
            throw new BadRequestException('startDate must be before endDate');
        }
        if (insertStart >= insertEnd) {
            throw new BadRequestException('startInsertDate must be before endInsertDate');
        }
        if (insertStart < start || insertEnd > end) {
            throw new BadRequestException('Insertion window must be within the session period');
        }
    }
}
