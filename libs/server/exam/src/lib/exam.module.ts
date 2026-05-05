import { Module } from '@nestjs/common';
import { ServerExamController } from './exam.controller';
import { ServerExamService } from './exam.service';

@Module({
  controllers: [ServerExamController],
  providers: [ServerExamService],
  exports: [ServerExamService],
})
export class ServerExamModule {}
