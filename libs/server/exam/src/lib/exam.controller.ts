import { Controller } from '@nestjs/common';
import { ServerExamService } from './exam.service';

@Controller('exam')
export class ServerExamController {
  constructor(private serverExamService: ServerExamService) {}
}
