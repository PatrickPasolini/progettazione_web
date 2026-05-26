import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { CourseEntity } from './course.entity.js';
import { DegreeEntity } from './degree.entity.js';
import { SessionEntity } from './session.entity.js';
import { TeacherEntity } from './teacher.entity.js';

@Entity('exam')
@Unique(['session', 'degree', 'examDate'])
export class ExamEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date', nullable: false })
    examDate: Date;

    @Column({ type: 'timestamp', nullable: false })
    startTime: Date;

    @Column({ type: 'timestamp', nullable: false })
    endTime: Date;

    @ManyToOne(() => CourseEntity, (course) => course.exams, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    @JoinColumn()
    course: CourseEntity;

    @ManyToOne(() => SessionEntity, (session) => session.exams, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    @JoinColumn()
    session: SessionEntity;

    @ManyToOne(() => TeacherEntity, (teacher) => teacher.exams, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    @JoinColumn()
    teacher: TeacherEntity;

    @ManyToOne(() => DegreeEntity, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    @JoinColumn()
    degree: DegreeEntity;
}
