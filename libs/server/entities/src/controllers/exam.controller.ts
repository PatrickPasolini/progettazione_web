import { Controller } from '@nestjs/common';
import { ServerExamService } from '../services/exam.service.js';

@Controller('exam')
export class ServerExamController {
    constructor(private serverExamService: ServerExamService) {}
}
