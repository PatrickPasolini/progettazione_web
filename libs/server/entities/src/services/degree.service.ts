import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DegreeEntity } from '../entities/degree.entity.js';
import { DegreeRepository } from '../repositories/degree.repository.js';
import { CreateDegreeDto } from '../entities/dto/create-degree.dto.js';
import { UpdateDegreeDto } from '../entities/dto/update-degree.dto.js';
import { DegreeType, DegreeYear, MacroArea } from '../entities/dto/degree.enum.js';
import { DegreeListItem } from '../interfaces/degree-list-item.js';

@Injectable()
export class ServerDegreeService {
    constructor(private readonly degreeRepository: DegreeRepository) {}

    findAll(): Promise<DegreeListItem[]> {
        return this.degreeRepository.findAll().then((degrees) => degrees.map(this.toListItem));
    }

    async findOne(id: number): Promise<DegreeListItem> {
        const degree = await this.degreeRepository.findById(id);
        if (!degree) throw new NotFoundException(`Degree with id ${id} not found`);
        return this.toListItem(degree);
    }

    async create(dto: CreateDegreeDto): Promise<DegreeListItem> {
        const exists = await this.degreeRepository.findByNameTypeYear(
            dto.degreeName,
            dto.degreeType,
            dto.degreeYear,
        );
        if (exists) throw new ConflictException('Degree with this name, type and year already exists');

        const degree = this.degreeRepository.create(dto);
        const saved = await this.degreeRepository.save(degree);
        return this.toListItem(saved);
    }

    async update(id: number, dto: UpdateDegreeDto): Promise<DegreeListItem> {
        const degree = await this.degreeRepository.findById(id);
        if (!degree) throw new NotFoundException(`Degree with id ${id} not found`);

        const newName      = dto.degreeName  ?? degree.degreeName;
        const newType      = dto.degreeType  ?? degree.degreeType;
        const newYear      = dto.degreeYear  ?? degree.degreeYear;
        const newMacroArea = dto.macroArea   ?? degree.macroArea;

        if (newName !== degree.degreeName || newType !== degree.degreeType || newYear !== degree.degreeYear) {
            const conflict = await this.degreeRepository.findByNameTypeYear(newName, newType, newYear);
            if (conflict && conflict.id !== id) {
                throw new ConflictException('Degree with this name, type and year already exists');
            }
        }

        Object.assign(degree, { degreeName: newName, degreeType: newType, degreeYear: newYear, macroArea: newMacroArea });
        const saved = await this.degreeRepository.save(degree);
        return this.toListItem(saved);
    }

    private toListItem(degree: DegreeEntity): DegreeListItem {
        return {
            id: degree.id,
            degreeName: degree.degreeName,
            degreeType: degree.degreeType,
            degreeYear: degree.degreeYear,
            macroArea: degree.macroArea,
        };
    }

    async remove(id: number): Promise<void> {
        const degree = await this.degreeRepository.findById(id);
        if (!degree) throw new NotFoundException(`Degree with id ${id} not found`);
        await this.degreeRepository.delete(id);
    }

    async seed(): Promise<void> {
        const degrees: Partial<DegreeEntity>[] = [
            { degreeName: 'Ingegneria Informatica', degreeType: DegreeType.BACHELOR, degreeYear: DegreeYear.FIRST,   macroArea: MacroArea.ENGINEERING },
            { degreeName: 'Ingegneria Informatica', degreeType: DegreeType.BACHELOR, degreeYear: DegreeYear.SECOND,  macroArea: MacroArea.ENGINEERING },
            { degreeName: 'Ingegneria Informatica', degreeType: DegreeType.BACHELOR, degreeYear: DegreeYear.THIRD,   macroArea: MacroArea.ENGINEERING },
            { degreeName: 'Ingegneria Informatica', degreeType: DegreeType.MASTER,   degreeYear: DegreeYear.FIRST,   macroArea: MacroArea.ENGINEERING },
            { degreeName: 'Ingegneria Informatica', degreeType: DegreeType.MASTER,   degreeYear: DegreeYear.SECOND,  macroArea: MacroArea.ENGINEERING },
            { degreeName: 'Ingegneria Elettronica', degreeType: DegreeType.BACHELOR, degreeYear: DegreeYear.FIRST,   macroArea: MacroArea.ENGINEERING },
            { degreeName: 'Ingegneria Elettronica', degreeType: DegreeType.BACHELOR, degreeYear: DegreeYear.SECOND,  macroArea: MacroArea.ENGINEERING },
            { degreeName: 'Ingegneria Elettronica', degreeType: DegreeType.BACHELOR, degreeYear: DegreeYear.THIRD,   macroArea: MacroArea.ENGINEERING },
            { degreeName: 'Ingegneria Elettronica', degreeType: DegreeType.MASTER,   degreeYear: DegreeYear.FIRST,   macroArea: MacroArea.ENGINEERING },
            { degreeName: 'Ingegneria Elettronica', degreeType: DegreeType.MASTER,   degreeYear: DegreeYear.SECOND,  macroArea: MacroArea.ENGINEERING },
        ];

        for (const d of degrees) {
            const exists = await this.degreeRepository.findByNameTypeYear(
                d.degreeName!,
                d.degreeType!,
                d.degreeYear!,
            );
            if (exists) continue;

            const degree = this.degreeRepository.create(d);
            await this.degreeRepository.save(degree);
        }
    }
}
