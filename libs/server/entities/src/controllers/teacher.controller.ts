import { Controller } from '@nestjs/common';
import { ServerTeacherService } from '../services/teacher.service.js';

@Controller('teacher')
export class ServerTeacherController {
    constructor(private serverTeacherService: ServerTeacherService) {}
}
