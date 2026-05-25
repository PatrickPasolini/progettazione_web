import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServerUsersModule } from '@server/users';
import { OrgBooksModule } from '@org/books';
import { DatabaseModule } from '@org/database';
import { ServerAuthModule } from '@server/auth';
import {
  ServerCourseModule,
  ServerDegreeModule,
  ServerExamModule,
  ServerSessionModule,
  ServerTeacherModule,
} from '@server/entities';

@Module({
  imports: [
    DatabaseModule,
    ServerUsersModule,
    ServerAuthModule,
    OrgBooksModule,
    ServerCourseModule,
    ServerDegreeModule,
    ServerExamModule,
    ServerSessionModule,
    ServerTeacherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
