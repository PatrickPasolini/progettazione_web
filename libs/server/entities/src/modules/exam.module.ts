import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerExamController } from '../controllers/exam.controller.js';
import { ServerExamService } from '../services/exam.service.js';
import { ExamEntity } from '../entities/exam.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ExamEntity])],
  controllers: [ServerExamController],
  providers: [ServerExamService],
  exports: [ServerExamService],
})
export class ServerExamModule {}
