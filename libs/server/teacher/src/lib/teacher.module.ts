import { Module } from '@nestjs/common';
import { ServerTeacherController } from './teacher.controller';
import { ServerTeacherService } from './teacher.service';

@Module({
  controllers: [ServerTeacherController],
  providers: [ServerTeacherService],
  exports: [ServerTeacherService],
})
export class ServerTeacherModule {}
