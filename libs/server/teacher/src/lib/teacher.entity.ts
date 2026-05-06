import { ChildEntity, JoinColumn, OneToMany } from 'typeorm';
import { UserEntity } from '@server/users';
import { UserRole } from '@server/users';
import { CourseEntity } from '@server/course';
import { ExamEntity } from '@server/exam';

@ChildEntity(UserRole.TEACHER)
export class TeacherEntity extends UserEntity {
    
    @OneToMany(()=>CourseEntity,(course)=>course.teacher)
    @JoinColumn()
    courses: CourseEntity[];
    
    @OneToMany(()=>ExamEntity,(exam)=>exam.teacher)
    @JoinColumn()
    exams: ExamEntity[];    
    
}