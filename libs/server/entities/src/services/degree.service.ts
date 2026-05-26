import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DegreeEntity } from '../entities/degree.entity.js';
import { DegreeRepository } from '../repositories/degree.repository.js';
import { CreateDegreeDto } from '../entities/dto/create-degree.dto.js';
import { UpdateDegreeDto } from '../entities/dto/update-degree.dto.js';
import { DegreeType, DegreeYear } from '../entities/dto/degree.enum.js';

@Injectable()
export class ServerDegreeService {
    constructor(private readonly degreeRepository: DegreeRepository) {}

    findAll(): Promise<DegreeEntity[]> {
        return this.degreeRepository.findAll();
    }

    async findOne(id: number): Promise<DegreeEntity> {
        const degree = await this.degreeRepository.findById(id);
        if (!degree) throw new NotFoundException(`Degree with id ${id} not found`);
        return degree;
    }

    async create(dto: CreateDegreeDto): Promise<DegreeEntity> {
        const exists = await this.degreeRepository.findByNameTypeYear(
            dto.degreeName,
            dto.degreeType,
            dto.degreeYear,
        );
        if (exists) throw new ConflictException('Degree with this name, type and year already exists');

        const degree = this.degreeRepository.create(dto);
        return this.degreeRepository.save(degree);
    }

    async update(id: number, dto: UpdateDegreeDto): Promise<DegreeEntity> {
        const degree = await this.degreeRepository.findById(id);
        if (!degree) throw new NotFoundException(`Degree with id ${id} not found`);

        const newName = dto.degreeName ?? degree.degreeName;
        const newType = dto.degreeType ?? degree.degreeType;
        const newYear = dto.degreeYear ?? degree.degreeYear;

        if (newName !== degree.degreeName || newType !== degree.degreeType || newYear !== degree.degreeYear) {
            const conflict = await this.degreeRepository.findByNameTypeYear(newName, newType, newYear);
            if (conflict && conflict.id !== id) {
                throw new ConflictException('Degree with this name, type and year already exists');
            }
        }

        Object.assign(degree, { degreeName: newName, degreeType: newType, degreeYear: newYear });
        return this.degreeRepository.save(degree);
    }

    async remove(id: number): Promise<void> {
        const degree = await this.degreeRepository.findById(id);
        if (!degree) throw new NotFoundException(`Degree with id ${id} not found`);
        await this.degreeRepository.delete(id);
    }

    async seed(): Promise<void> {
        const degrees: Partial<DegreeEntity>[] = [
            { degreeName: 'Informatica',              degreeType: DegreeType.BACHELOR, degreeYear: DegreeYear.FIRST  },
            { degreeName: 'Informatica',              degreeType: DegreeType.BACHELOR, degreeYear: DegreeYear.SECOND },
            { degreeName: 'Informatica',              degreeType: DegreeType.BACHELOR, degreeYear: DegreeYear.THIRD  },
            { degreeName: 'Ingegneria Informatica',   degreeType: DegreeType.BACHELOR, degreeYear: DegreeYear.FIRST  },
            { degreeName: 'Ingegneria Informatica',   degreeType: DegreeType.BACHELOR, degreeYear: DegreeYear.SECOND },
            { degreeName: 'Ingegneria Informatica',   degreeType: DegreeType.BACHELOR, degreeYear: DegreeYear.THIRD  },
            { degreeName: 'Informatica (Magistrale)', degreeType: DegreeType.MASTER,   degreeYear: DegreeYear.FIRST  },
            { degreeName: 'Informatica (Magistrale)', degreeType: DegreeType.MASTER,   degreeYear: DegreeYear.SECOND },
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
