import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { DegreeType, DegreeYear } from './dto/degree.enum.js';
import { CourseEntity } from './course.entity.js';
import { SessionEntity } from './session.entity.js';

@Entity('degree')
export class DegreeEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
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

    @ManyToMany(() => CourseEntity, (course) => course.degrees)
    @JoinTable({
        name: 'degree_courses',
        joinColumn: {name: 'degree_id', referencedColumnName:'id'},
        inverseJoinColumn: {name: 'course_id', referencedColumnName:'id'}
    })
    courses: CourseEntity[];

    @ManyToMany(() => SessionEntity, (session) => session.degrees)
    sessions: SessionEntity[];
}
