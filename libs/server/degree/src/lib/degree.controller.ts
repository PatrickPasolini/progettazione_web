import { Controller } from '@nestjs/common';
import { ServerDegreeService } from './degree.service';

@Controller('degree')
export class ServerDegreeController {
  constructor(private serverDegreeService: ServerDegreeService) {}
}
