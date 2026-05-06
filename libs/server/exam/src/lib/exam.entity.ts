import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { forwardRef } from '@nestjs/common';
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

    @ManyToOne(() => forwardRef(() => CourseEntity), (course) => course.exams, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    @JoinColumn()
    course: CourseEntity;

    @ManyToOne(() => forwardRef(() => SessionEntity), (session) => session.exams, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    @JoinColumn()
    session: SessionEntity;

    @ManyToOne(() => forwardRef(() => TeacherEntity), (teacher) => teacher.exams, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    @JoinColumn()
    teacher: TeacherEntity;
    
}