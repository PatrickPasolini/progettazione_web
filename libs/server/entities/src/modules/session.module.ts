import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerSessionController } from '../controllers/session.controller.js';
import { ServerSessionService } from '../services/session.service.js';
import { SessionEntity } from '../entities/session.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity])],
  controllers: [ServerSessionController],
  providers: [ServerSessionService],
  exports: [ServerSessionService],
})
export class ServerSessionModule {}
