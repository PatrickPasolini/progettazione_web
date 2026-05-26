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
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
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
    create(@Body() dto: CreateSessionDto) {
        return this.serverSessionService.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number })
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
