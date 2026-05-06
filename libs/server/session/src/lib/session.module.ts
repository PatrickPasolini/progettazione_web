import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerSessionController } from './session.controller';
import { ServerSessionService } from './session.service';
import { SessionEntity } from './session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity])],
  controllers: [ServerSessionController],
  providers: [ServerSessionService],
  exports: [ServerSessionService],
})
export class ServerSessionModule {}
