import { Injectable, NotFoundException } from '@nestjs/common';
import { DegreeEntity } from '../entities/degree.entity.js';
import { DegreeRepository } from '../repositories/degree.repository.js';
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
