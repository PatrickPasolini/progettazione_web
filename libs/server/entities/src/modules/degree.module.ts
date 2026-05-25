import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerDegreeController } from '../controllers/degree.controller.js';
import { ServerDegreeService } from '../services/degree.service.js';
import { DegreeEntity } from '../entities/degree.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([DegreeEntity])],
  controllers: [ServerDegreeController],
  providers: [ServerDegreeService],
  exports: [ServerDegreeService],
})
export class ServerDegreeModule {}
