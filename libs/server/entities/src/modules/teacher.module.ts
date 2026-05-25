import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerTeacherController } from '../controllers/teacher.controller.js';
import { ServerTeacherService } from '../services/teacher.service.js';
import { TeacherEntity } from '../entities/teacher.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherEntity])],
  controllers: [ServerTeacherController],
  providers: [ServerTeacherService],
  exports: [ServerTeacherService],
})
export class ServerTeacherModule {}
