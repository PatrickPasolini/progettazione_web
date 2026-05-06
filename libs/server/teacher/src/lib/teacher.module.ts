import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerTeacherController } from './teacher.controller';
import { ServerTeacherService } from './teacher.service';
import { TeacherEntity } from './teacher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherEntity])],
  controllers: [ServerTeacherController],
  providers: [ServerTeacherService],
  exports: [ServerTeacherService],
})
export class ServerTeacherModule {}
