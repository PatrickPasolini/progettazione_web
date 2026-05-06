import { Module } from '@nestjs/common';
import { ServerCourseController } from './course.controller';
import { ServerCourseService } from './course.service';
import { CourseEntity } from './course.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity])],
  controllers: [ServerCourseController],
  providers: [ServerCourseService],
  exports: [ServerCourseService],
})
export class ServerCourseModule {}
