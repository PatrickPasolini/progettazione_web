import { Controller } from '@nestjs/common';
import { ServerDegreeService } from '../services/degree.service.js';

@Controller('degree')
export class ServerDegreeController {
    constructor(private serverDegreeService: ServerDegreeService) {}
}
