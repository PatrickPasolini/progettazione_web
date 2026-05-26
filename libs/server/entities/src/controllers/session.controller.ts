import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { CreateSessionDto } from '../entities/dto/create-session.dto.js';
import { UpdateSessionDto } from '../entities/dto/update-session.dto.js';
import { ServerSessionService } from '../services/session.service.js';

@ApiTags('Sessions APIs')
@Controller('session')
export class ServerSessionController {
    constructor(private serverSessionService: ServerSessionService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    findAll() {
        return this.serverSessionService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.serverSessionService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            required: ['startDate', 'endDate', 'startInsertDate', 'endInsertDate'],
            properties: {
                startDate:       { type: 'string', format: 'date', example: '2025-06-01' },
                endDate:         { type: 'string', format: 'date', example: '2025-07-31' },
                startInsertDate: { type: 'string', format: 'date', example: '2025-05-01', description: 'Inizio finestra inserimento esami' },
                endInsertDate:   { type: 'string', format: 'date', example: '2025-05-31', description: 'Fine finestra inserimento esami' },
                degreeIds: { type: 'array', items: { type: 'integer' }, example: [1, 2], description: 'ID corsi di laurea associati (opzionale)' },
            },
        },
    })
    create(@Body() dto: CreateSessionDto) {
        return this.serverSessionService.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                startDate:       { type: 'string', format: 'date', example: '2025-06-01' },
                endDate:         { type: 'string', format: 'date', example: '2025-07-31' },
                startInsertDate: { type: 'string', format: 'date', example: '2025-05-01', description: 'Inizio finestra inserimento esami' },
                endInsertDate:   { type: 'string', format: 'date', example: '2025-05-31', description: 'Fine finestra inserimento esami' },
                degreeIds: { type: 'array', items: { type: 'integer' }, example: [1, 2], description: 'ID corsi di laurea associati (opzionale)' },
            },
        },
    })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSessionDto) {
        return this.serverSessionService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.serverSessionService.remove(id);
    }
}
