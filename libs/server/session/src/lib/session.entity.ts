import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany, JoinColumn } from 'typeorm';
import { DegreeEntity } from '@server/degree';
import { ExamEntity } from '@server/exam';

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
       
    @ManyToMany(() => DegreeEntity, (degree) => degree.courses)
    @JoinTable({
        name: 'session_degrees',
        joinColumn: {name: 'session_id', referencedColumnName:'id'},
        inverseJoinColumn: {name: 'degree_id', referencedColumnName:'id'}
    })
    degrees: DegreeEntity[];

    @OneToMany(() => ExamEntity, (exam) => exam.session)
    @JoinColumn()
    exams: ExamEntity[];

}

