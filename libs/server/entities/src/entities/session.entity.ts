import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from 'typeorm';
import { MacroArea } from './dto/degree.enum.js';
import { ExamEntity } from './exam.entity.js';

@Entity('session')
export class SessionEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date', nullable: false })
    startDate: Date;

    @Column({ type: 'date', nullable: false })
    endDate: Date;

    @Column({ type: 'date', nullable: false })
    startInsertDate: Date;

    @Column({ type: 'date', nullable: false })
    endInsertDate: Date;

    @Column({ type: 'enum', enum: MacroArea, nullable: false })
    macroArea: MacroArea;

    @OneToMany(() => ExamEntity, (exam) => exam.session)
    @JoinColumn()
    exams: ExamEntity[];
}
