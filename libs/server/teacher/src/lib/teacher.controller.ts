import { Controller } from '@nestjs/common';
import { ServerTeacherService } from './teacher.service';

@Controller('teacher')
export class ServerTeacherController {
  constructor(private serverTeacherService: ServerTeacherService) {}
}
