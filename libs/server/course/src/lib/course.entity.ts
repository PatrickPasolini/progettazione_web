import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinColumn } from 'typeorm';
import { forwardRef } from '@nestjs/common';
import { TeacherEntity } from '@server/teacher';
import { ExamEntity } from '@server/exam';
import { DegreeEntity } from '@server/degree';

@Entity('course')
export class CourseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
    courseName: string;

    @OneToMany(() => forwardRef(() => ExamEntity), (exam) => exam.course)
    @JoinColumn()
    exams: ExamEntity[];

    @ManyToOne(() => forwardRef(() => TeacherEntity), (teacher) => teacher.courses, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    @JoinColumn()
    teacher: TeacherEntity;

    @ManyToMany(() => DegreeEntity, (degree) => degree.courses, { eager: true })
    degrees: DegreeEntity[];

}   

