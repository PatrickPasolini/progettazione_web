import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerExamController } from '../controllers/exam.controller.js';
import { ServerExamService } from '../services/exam.service.js';
import { ExamEntity } from '../entities/exam.entity.js';
import { SessionEntity } from '../entities/session.entity.js';
import { CourseEntity } from '../entities/course.entity.js';
import { DegreeEntity } from '../entities/degree.entity.js';
import { TeacherEntity } from '../entities/teacher.entity.js';
import { ExamRepository } from '../repositories/exam.repository.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { CourseRepository } from '../repositories/course.repository.js';
import { DegreeRepository } from '../repositories/degree.repository.js';
import { TeacherRepository } from '../repositories/teacher.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([ExamEntity, SessionEntity, CourseEntity, DegreeEntity, TeacherEntity])],
  controllers: [ServerExamController],
  providers: [
    ServerExamService,
    ExamRepository,
    SessionRepository,
    CourseRepository,
    DegreeRepository,
    TeacherRepository,
  ],
  exports: [ServerExamService],
})
export class ServerExamModule {}
