import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerTeacherController } from '../controllers/teacher.controller.js';
import { ServerTeacherService } from '../services/teacher.service.js';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { TeacherEntity } from '../entities/teacher.entity.js';
import { UserEntity } from '@server/users';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherEntity, UserEntity])],
  controllers: [ServerTeacherController],
  providers: [ServerTeacherService, TeacherRepository],
  exports: [ServerTeacherService, TeacherRepository],
})
export class ServerTeacherModule {}
