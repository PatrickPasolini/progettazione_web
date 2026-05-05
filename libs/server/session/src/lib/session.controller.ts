import { Controller } from '@nestjs/common';
import { ServerSessionService } from './session.service';

@Controller('session')
export class ServerSessionController {
  constructor(private serverSessionService: ServerSessionService) {}
}
