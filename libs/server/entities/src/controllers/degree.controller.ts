import { Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { ServerDegreeService } from '../services/degree.service.js';

@ApiTags('Degrees APIs')
@Controller('degree')
export class ServerDegreeController {
    constructor(private readonly serverDegreeService: ServerDegreeService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    findAll() {
        return this.serverDegreeService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number, description: 'ID del corso di laurea' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.serverDegreeService.findOne(id);
    }

    @Post('populate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    seed() {
        return this.serverDegreeService.seed();
    }
}
