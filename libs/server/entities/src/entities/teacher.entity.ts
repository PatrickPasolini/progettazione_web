import { ChildEntity, JoinColumn, OneToMany } from 'typeorm';
import { UserEntity } from '@server/users';
import { CourseEntity } from './course.entity.js';
import { ExamEntity } from './exam.entity.js';

@ChildEntity()
export class TeacherEntity extends UserEntity {

    @OneToMany(() => CourseEntity, (course) => course.teacher)
    @JoinColumn()
    courses: CourseEntity[];

    @OneToMany(() => ExamEntity, (exam) => exam.teacher)
    @JoinColumn()
    exams: ExamEntity[];
}
