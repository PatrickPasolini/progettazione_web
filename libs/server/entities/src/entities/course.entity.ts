import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinColumn } from 'typeorm';
import { TeacherEntity } from './teacher.entity.js';
import { ExamEntity } from './exam.entity.js';
import { DegreeEntity } from './degree.entity.js';

@Entity('course')
export class CourseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    courseName: string;

    @OneToMany(() => ExamEntity, (exam) => exam.course)
    @JoinColumn()
    exams: ExamEntity[];

    @ManyToOne(() => TeacherEntity, (teacher) => teacher.courses, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    @JoinColumn()
    teacher: TeacherEntity;

    @ManyToMany(() => DegreeEntity, (degree) => degree.courses, { eager: true })
    degrees: DegreeEntity[];
}
