import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerExamController } from './exam.controller';
import { ServerExamService } from './exam.service';
import { ExamEntity } from './exam.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExamEntity])],
  controllers: [ServerExamController],
  providers: [ServerExamService],
  exports: [ServerExamService],
})
export class ServerExamModule {}
