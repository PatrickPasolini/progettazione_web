import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerCourseController } from '../controllers/course.controller.js';
import { ServerCourseService } from '../services/course.service.js';
import { CourseEntity } from '../entities/course.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity])],
  controllers: [ServerCourseController],
  providers: [ServerCourseService],
  exports: [ServerCourseService],
})
export class ServerCourseModule {}
