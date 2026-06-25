import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Unique } from 'typeorm';
import { DegreeType, DegreeYear, MacroArea } from './dto/degree.enum.js';
import { SessionEntity } from './session.entity.js';

@Entity('degree')
@Unique(['degreeName', 'degreeType', 'degreeYear'])
export class DegreeEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    degreeName: string;

    @Column({
        type: 'enum',
        enum: DegreeType,
        default: DegreeType.BACHELOR
    })
    degreeType: DegreeType;

    @Column({
        type: 'enum',
        enum: DegreeYear,
        default: DegreeYear.FIRST
    })
    degreeYear: DegreeYear;

    @Column({ type: 'enum', enum: MacroArea, nullable: false })
    macroArea: MacroArea;

    @ManyToMany(() => SessionEntity, (session) => session.degrees)
    sessions: SessionEntity[];
}
