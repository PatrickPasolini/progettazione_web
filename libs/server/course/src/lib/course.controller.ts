import { Controller } from '@nestjs/common';
import { ServerCourseService } from './course.service';

@Controller('course')
export class ServerCourseController {
  constructor(private serverCourseService: ServerCourseService) {}
}
