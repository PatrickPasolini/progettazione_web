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
import { CreateTeacherDto } from '../entities/dto/create-teacher.dto.js';
import { UpdateTeacherDto } from '../entities/dto/update-teacher.dto.js';
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

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SECRETARY)
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            required: ['name', 'surname', 'email', 'password'],
            properties: {
                name:     { type: 'string', example: 'Mario' },
                surname:  { type: 'string', example: 'Rossi' },
                email:    { type: 'string', format: 'email', example: 'mario.rossi@univ.it' },
                password: { type: 'string', minLength: 6, example: 'Secret1!' },
            },
        },
    })
    create(@Body() dto: CreateTeacherDto) {
        return this.serverTeacherService.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SECRETARY)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name:     { type: 'string', example: 'Mario' },
                surname:  { type: 'string', example: 'Rossi' },
                email:    { type: 'string', format: 'email', example: 'mario.rossi@univ.it' },
                password: { type: 'string', minLength: 6, example: 'Secret1!' },
            },
        },
    })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTeacherDto) {
        return this.serverTeacherService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SECRETARY)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.serverTeacherService.remove(id);
    }

    @Post('populate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    seed() {
        return this.serverTeacherService.seed();
    }
}
