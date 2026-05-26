import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerSessionController } from '../controllers/session.controller.js';
import { ServerSessionService } from '../services/session.service.js';
import { SessionEntity } from '../entities/session.entity.js';
import { DegreeEntity } from '../entities/degree.entity.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { DegreeRepository } from '../repositories/degree.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity, DegreeEntity])],
  controllers: [ServerSessionController],
  providers: [ServerSessionService, SessionRepository, DegreeRepository],
  exports: [ServerSessionService],
})
export class ServerSessionModule {}
