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
import { CreateDegreeDto } from '../entities/dto/create-degree.dto.js';
import { UpdateDegreeDto } from '../entities/dto/update-degree.dto.js';
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

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY, UserRole.ADMIN)
    @ApiBearerAuth()
    create(@Body() dto: CreateDegreeDto) {
        return this.serverDegreeService.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDegreeDto) {
        return this.serverDegreeService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.serverDegreeService.remove(id);
    }

    @Post('populate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    seed() {
        return this.serverDegreeService.seed();
    }
}
