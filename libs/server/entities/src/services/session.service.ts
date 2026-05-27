import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SessionRepository } from '../repositories/session.repository.js';
import { DegreeRepository } from '../repositories/degree.repository.js';
import { CreateSessionDto } from '../entities/dto/create-session.dto.js';
import { UpdateSessionDto } from '../entities/dto/update-session.dto.js';
import { MacroArea } from '../entities/dto/degree.enum.js';
import { SessionEntity } from '../entities/session.entity.js';

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
            startDate:       new Date(dto.startDate),
            endDate:         new Date(dto.endDate),
            startInsertDate: new Date(dto.startInsertDate),
            endInsertDate:   new Date(dto.endInsertDate),
            macroArea:       dto.macroArea,
        });

        session.degrees = dto.degreeIds?.length
            ? await this.degreeRepository.findByIds(dto.degreeIds)
            : [];

        return this.sessionRepository.save(session);
    }

    async update(id: number, dto: UpdateSessionDto): Promise<SessionEntity> {
        const session = await this.sessionRepository.findByIdWithDegrees(id);
        if (!session) throw new NotFoundException(`Session with id ${id} not found`);

        const startDate      = dto.startDate      ? new Date(dto.startDate)      : session.startDate;
        const endDate        = dto.endDate        ? new Date(dto.endDate)        : session.endDate;
        const startInsertDate = dto.startInsertDate ? new Date(dto.startInsertDate) : session.startInsertDate;
        const endInsertDate  = dto.endInsertDate  ? new Date(dto.endInsertDate)  : session.endInsertDate;

        this.validateDates(
            startDate.toISOString().slice(0, 10),
            endDate.toISOString().slice(0, 10),
            startInsertDate.toISOString().slice(0, 10),
            endInsertDate.toISOString().slice(0, 10),
        );

        Object.assign(session, {
            startDate,
            endDate,
            startInsertDate,
            endInsertDate,
            ...(dto.macroArea && { macroArea: dto.macroArea }),
        });

        if (dto.degreeIds !== undefined) {
            session.degrees = dto.degreeIds.length
                ? await this.degreeRepository.findByIds(dto.degreeIds)
                : [];
        }

        return this.sessionRepository.save(session);
    }

    async remove(id: number): Promise<void> {
        const session = await this.sessionRepository.findById(id);
        if (!session) throw new NotFoundException(`Session with id ${id} not found`);
        await this.sessionRepository.delete(id);
    }

    async seed(): Promise<void> {
        const sessions: { startDate: Date; endDate: Date; startInsertDate: Date; endInsertDate: Date; macroArea: MacroArea }[] = [
            {
                startDate:       new Date('2026-06-01'),
                endDate:         new Date('2026-07-31'),
                startInsertDate: new Date('2026-04-01'),
                endInsertDate:   new Date('2026-04-30'),
                macroArea:       MacroArea.ENGINEERING,
            },
            {
                startDate:       new Date('2026-09-01'),
                endDate:         new Date('2026-09-30'),
                startInsertDate: new Date('2026-05-01'),
                endInsertDate:   new Date('2026-06-30'),
                macroArea:       MacroArea.ENGINEERING,
            },
        ];

        for (const s of sessions) {
            const session = this.sessionRepository.create(s);
            await this.sessionRepository.save(session);
        }
    }

    private validateDates(
        startDate: string,
        endDate: string,
        startInsertDate: string,
        endInsertDate: string,
    ): void {
        const start       = new Date(startDate);
        const end         = new Date(endDate);
        const insertStart = new Date(startInsertDate);
        const insertEnd   = new Date(endInsertDate);

        if (start >= end)
            throw new BadRequestException('startDate must be before endDate');
        if (insertStart >= insertEnd)
            throw new BadRequestException('startInsertDate must be before endInsertDate');
        if (insertEnd >= start)
            throw new BadRequestException('endInsertDate must be before startDate');
    }
}
