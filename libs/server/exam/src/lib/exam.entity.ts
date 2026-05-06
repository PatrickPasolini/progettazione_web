import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CourseEntity } from '@server/course';
import { SessionEntity } from '@server/session';
import { TeacherEntity } from '@server/teacher';


@Entity('exam')
export class ExamEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date', nullable: false })
    examDate: Date;

    @Column({ type: 'timestamp', nullable: false})
    startTime: Date

    @Column({ type: 'timestamp', nullable: false})
    endTime: Date

    @ManyToOne(() => CourseEntity, (course) => course.exams, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    @JoinColumn()
    course: CourseEntity;

    @ManyToOne(() => SessionEntity, (session) => session.exams, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    @JoinColumn()
    session: SessionEntity;

    @ManyToOne(() => TeacherEntity, (teacher) => teacher.exams, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    @JoinColumn()
    teacher: TeacherEntity;
    
}