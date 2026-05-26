import { Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { ServerTeacherService } from '../services/teacher.service.js';

@ApiTags('Teachers APIs')
@Controller('teacher')
export class ServerTeacherController {
    constructor(private readonly serverTeacherService: ServerTeacherService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    findAll() {
        return this.serverTeacherService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number, description: 'ID del docente' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.serverTeacherService.findOne(id);
    }

    @Post('populate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    seed() {
        return this.serverTeacherService.seed();
    }
}
