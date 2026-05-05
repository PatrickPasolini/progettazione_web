import { Module } from '@nestjs/common';
import { ServerSessionController } from './session.controller';
import { ServerSessionService } from './session.service';

@Module({
  controllers: [ServerSessionController],
  providers: [ServerSessionService],
  exports: [ServerSessionService],
})
export class ServerSessionModule {}
