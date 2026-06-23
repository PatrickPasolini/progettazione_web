import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SessionRepository } from '../repositories/session.repository.js';
import { DegreeRepository } from '../repositories/degree.repository.js';
import { CreateSessionDto } from '../entities/dto/create-session.dto.js';
import { UpdateSessionDto } from '../entities/dto/update-session.dto.js';
import { MacroArea } from '../entities/dto/degree.enum.js';
import { SessionEntity } from '../entities/session.entity.js';
import { SessionListItem } from '../interfaces/session-list-item.js';

@Injectable()
export class ServerSessionService {
    constructor(
        private readonly sessionRepository: SessionRepository,
        private readonly degreeRepository: DegreeRepository,
    ) {}

    async findAll(): Promise<SessionListItem[]> {
        const sessions = await this.sessionRepository.findAll();
        return sessions.map(s => this.toListItem(s));
    }

    async findActiveByTeacher(teacherId: number): Promise<SessionListItem[]> {
        const sessions = await this.sessionRepository.findActiveByTeacher(teacherId);
        return sessions.map(s => this.toListItem(s));
    }

    async findOne(id: number): Promise<SessionListItem> {
        const session = await this.sessionRepository.findById(id);
        if (!session) throw new NotFoundException(`Session with id ${id} not found`);
        return this.toListItem(session);
    }

    private toListItem(session: SessionEntity): SessionListItem {
        return {
            id: session.id,
            startDate: session.startDate,
            endDate: session.endDate,
            startInsertDate: session.startInsertDate,
            endInsertDate: session.endInsertDate,
            macroArea: session.macroArea,
            examLimit: session.examLimit,
        }
    }

    async create(dto: CreateSessionDto): Promise<SessionListItem> {
        this.validateDates(dto.startDate, dto.endDate, dto.startInsertDate, dto.endInsertDate);

        const session = this.sessionRepository.create({
            startDate:       new Date(dto.startDate),
            endDate:         new Date(dto.endDate),
            startInsertDate: new Date(dto.startInsertDate),
            endInsertDate:   new Date(dto.endInsertDate),
            macroArea:       dto.macroArea,
            examLimit:       dto.examLimit,
        });

        session.degrees = dto.degreeIds?.length
            ? await this.degreeRepository.findByIds(dto.degreeIds)
            : [];

        return this.toListItem(await this.sessionRepository.save(session));
    }

    async update(id: number, dto: UpdateSessionDto): Promise<SessionListItem> {
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
            ...(dto.examLimit !== undefined && { examLimit: dto.examLimit }),
        });

        if (dto.degreeIds !== undefined) {
            session.degrees = dto.degreeIds.length
                ? await this.degreeRepository.findByIds(dto.degreeIds)
                : [];
        }

        return this.toListItem(await this.sessionRepository.save(session));
    }

    async remove(id: number): Promise<void> {
        const session = await this.sessionRepository.findById(id);
        if (!session) throw new NotFoundException(`Session with id ${id} not found`);
        await this.sessionRepository.delete(id);
    }

    async seed(): Promise<void> {
        // Reset: svuota le sessioni (e exam/join dipendenti) per un seed pulito.
        await this.sessionRepository.clearCascade();

        // Una sessione per ciascuna area. Finestra inserimento APERTA oggi
        // (start < oggi < end) e chiusa prima dell'inizio sessione:
        // startInsertDate < endInsertDate < startDate < endDate.
        const sessions: Partial<SessionEntity>[] = [
            MacroArea.ECONOMICS,
            MacroArea.LAW,
            MacroArea.ENGINEERING,
            MacroArea.MEDICINE,
        ].map((macroArea) => ({
            startInsertDate: new Date('2026-06-01'),
            endInsertDate:   new Date('2026-07-15'),
            startDate:       new Date('2026-07-20'),
            endDate:         new Date('2026-09-30'),
            macroArea,
            examLimit:       1,
        }));

        for (const s of sessions) {
            const session = this.sessionRepository.create(s);
            session.degrees = await this.degreeRepository.findByMacroArea(s.macroArea!);
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
