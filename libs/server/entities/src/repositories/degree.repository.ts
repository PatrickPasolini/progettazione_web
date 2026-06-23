import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository } from 'typeorm';
import { DegreeEntity } from '../entities/degree.entity.js';
import { DegreeType, DegreeYear, MacroArea } from '../entities/dto/degree.enum.js';

@Injectable()
export class DegreeRepository {
    constructor(
        @InjectRepository(DegreeEntity)
        private readonly repo: Repository<DegreeEntity>,
    ) {}

    findAll(): Promise<DegreeEntity[]> {
        return this.repo.find({ order: { id: 'ASC' } });
    }

    findById(id: number): Promise<DegreeEntity | null> {
        return this.repo.findOne({ where: { id } });
    }

    findByIds(ids: number[]): Promise<DegreeEntity[]> {
        return this.repo.findBy({ id: In(ids) });
    }

    findByMacroArea(macroArea: MacroArea): Promise<DegreeEntity[]> {
        return this.repo.findBy({ macroArea });
    }

    findByNameTypeYear(
        degreeName: string,
        degreeType: DegreeType,
        degreeYear: DegreeYear,
    ): Promise<DegreeEntity | null> {
        return this.repo.findOne({ where: { degreeName, degreeType, degreeYear } });
    }

    create(data: Partial<DegreeEntity>): DegreeEntity {
        return this.repo.create(data);
    }

    save(degree: DegreeEntity): Promise<DegreeEntity> {
        return this.repo.save(degree);
    }

    delete(id: number): Promise<DeleteResult> {
        return this.repo.delete(id);
    }

    // Svuota la tabella degree. CASCADE pulisce course, exam e il join session_degrees.
    async clearCascade(): Promise<void> {
        await this.repo.query('TRUNCATE TABLE "degree" RESTART IDENTITY CASCADE');
    }
}
