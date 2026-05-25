import { Controller } from '@nestjs/common';
import { ServerCourseService } from '../services/course.service.js';

@Controller('course')
export class ServerCourseController {
    constructor(private serverCourseService: ServerCourseService) {}
}
