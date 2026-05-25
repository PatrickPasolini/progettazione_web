import { Controller } from '@nestjs/common';
import { ServerSessionService } from '../services/session.service.js';

@Controller('session')
export class ServerSessionController {
    constructor(private serverSessionService: ServerSessionService) {}
}
