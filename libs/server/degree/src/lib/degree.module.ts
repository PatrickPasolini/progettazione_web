import { Module } from '@nestjs/common';
import { ServerDegreeController } from './degree.controller';
import { ServerDegreeService } from './degree.service';

@Module({
  controllers: [ServerDegreeController],
  providers: [ServerDegreeService],
  exports: [ServerDegreeService],
})
export class ServerDegreeModule {}
