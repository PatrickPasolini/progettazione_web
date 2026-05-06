import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServerUsersModule } from '@server/users';
import { OrgBooksModule } from '@org/books';
import { DatabaseModule } from '@org/database';
import { ServerAuthModule } from '@server/auth';
import { ServerDegreeModule } from '@server/degree';
import { ServerExamModule } from '@server/exam';
import { ServerSessionModule } from '@server/session';
import { ServerTeacherModule } from '@server/teacher';
import { ServerCourseModule } from '@server/course';

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
