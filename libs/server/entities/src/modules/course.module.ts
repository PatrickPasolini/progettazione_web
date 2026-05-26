import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerCourseController } from '../controllers/course.controller.js';
import { ServerCourseService } from '../services/course.service.js';
import { CourseRepository } from '../repositories/course.repository.js';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { DegreeRepository } from '../repositories/degree.repository.js';
import { CourseEntity } from '../entities/course.entity.js';
import { TeacherEntity } from '../entities/teacher.entity.js';
import { DegreeEntity } from '../entities/degree.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity, TeacherEntity, DegreeEntity])],
  controllers: [ServerCourseController],
  providers: [ServerCourseService, CourseRepository, TeacherRepository, DegreeRepository],
  exports: [ServerCourseService, CourseRepository],
})
export class ServerCourseModule {}
