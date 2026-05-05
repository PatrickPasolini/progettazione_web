import { Module } from '@nestjs/common';
import { ServerCourseController } from './course.controller';
import { ServerCourseService } from './course.service';

@Module({
  controllers: [ServerCourseController],
  providers: [ServerCourseService],
  exports: [ServerCourseService],
})
export class ServerCourseModule {}
