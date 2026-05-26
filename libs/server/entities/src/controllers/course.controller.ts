import {
    Body, Controller, Delete, Get, Param, ParseIntPipe,
    Patch, Post, Query, UseGuards, ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { ServerCourseService } from '../services/course.service.js';
import { CreateCourseDto } from '../dto/create-course.dto.js';
import { UpdateCourseDto } from '../dto/update-course.dto.js';

@ApiTags('Courses APIs')
@Controller('course')
export class ServerCourseController {
    constructor(private readonly serverCourseService: ServerCourseService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'teacherId', required: false, type: Number, description: 'Filtra per ID docente' })
    findAll(@Query('teacherId') teacherId?: string) {
        return this.serverCourseService.findAll(teacherId ? +teacherId : undefined);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number, description: 'ID del corso' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.serverCourseService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.TEACHER)
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            required: ['courseName', 'teacherId'],
            properties: {
                courseName: { type: 'string', example: 'Analisi Matematica I' },
                teacherId: { type: 'integer', example: 1, description: 'ID del docente titolare' },
                degreeIds: {
                    type: 'array',
                    items: { type: 'integer' },
                    example: [1, 2],
                    description: 'Lista di ID dei corsi di laurea (opzionale)',
                },
            },
        },
    })
    create(@Body(ValidationPipe) dto: CreateCourseDto) {
        return this.serverCourseService.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SECRETARY, UserRole.TEACHER)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number, description: 'ID del corso da aggiornare' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                courseName: { type: 'string', example: 'Analisi Matematica II' },
                teacherId: { type: 'integer', example: 2, description: 'Nuovo ID del docente titolare' },
                degreeIds: {
                    type: 'array',
                    items: { type: 'integer' },
                    example: [1, 3],
                    description: 'Nuova lista di ID dei corsi di laurea',
                },
            },
        },
    })
    update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) dto: UpdateCourseDto) {
        return this.serverCourseService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SECRETARY)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number, description: 'ID del corso da eliminare' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.serverCourseService.remove(id);
    }

    @Post('populate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    seed() {
        return this.serverCourseService.seed();
    }
}
