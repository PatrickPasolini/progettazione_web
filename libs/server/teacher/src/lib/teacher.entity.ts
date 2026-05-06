import { ChildEntity, JoinColumn, OneToMany } from 'typeorm';
import { forwardRef } from '@nestjs/common';
import { UserEntity } from '@server/users';
import { UserRole } from '@server/users';
import { CourseEntity } from '@server/course';
import { ExamEntity } from '../../../exam/src/lib/exam.entity';

@ChildEntity(UserRole.TEACHER)
export class TeacherEntity extends UserEntity {
    
    @OneToMany(()=> forwardRef(() => CourseEntity),(course)=>course.teacher)
    @JoinColumn()
    courses: CourseEntity[];
    
    @OneToMany(()=> forwardRef(() => ExamEntity),(exam)=>exam.teacher)
    @JoinColumn()
    exams: ExamEntity[];    
    
}