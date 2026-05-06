import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerDegreeController } from './degree.controller';
import { ServerDegreeService } from './degree.service';
import { DegreeEntity } from './degree.entity';

@Module({

  imports: [TypeOrmModule.forFeature([DegreeEntity])],
  controllers: [ServerDegreeController],
  providers: [ServerDegreeService],
  exports: [ServerDegreeService],
})
export class ServerDegreeModule {}
