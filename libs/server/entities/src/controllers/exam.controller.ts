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
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { TeacherEntity } from '../entities/teacher.entity.js';
import { CreateExamDto } from '../entities/dto/create-exam.dto.js';
import { UpdateExamDto } from '../entities/dto/update-exam.dto.js';
import { ServerExamService } from '../services/exam.service.js';

@ApiTags('Exams APIs')
@Controller('exam')
export class ServerExamController {
    constructor(private serverExamService: ServerExamService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'sessionId', required: false, type: Number })
    @ApiQuery({ name: 'degreeId', required: false, type: Number })
    @ApiQuery({ name: 'teacherId', required: false, type: Number })
    findAll(
        @Query('sessionId') sessionId?: string,
        @Query('degreeId') degreeId?: string,
        @Query('teacherId') teacherId?: string,
    ) {
        return this.serverExamService.findAll(
            sessionId ? parseInt(sessionId) : undefined,
            degreeId ? parseInt(degreeId) : undefined,
            teacherId ? parseInt(teacherId) : undefined,
        );
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.serverExamService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER)
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            required: ['sessionId', 'courseId', 'degreeId', 'examDate', 'startTime', 'endTime'],
            properties: {
                sessionId: { type: 'integer', example: 1 },
                courseId:  { type: 'integer', example: 5 },
                degreeId:  { type: 'integer', example: 1 },
                examDate:  { type: 'string', format: 'date', example: '2025-06-13' },
                startTime: { type: 'string', format: 'date-time', example: '2025-06-13T09:00:00' },
                endTime:   { type: 'string', format: 'date-time', example: '2025-06-13T11:00:00' },
            },
        },
    })
    create(@Body() dto: CreateExamDto, @CurrentUser() teacher: TeacherEntity) {
        return this.serverExamService.create(dto, teacher);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                courseId:  { type: 'integer', example: 5 },
                degreeId:  { type: 'integer', example: 1 },
                examDate:  { type: 'string', format: 'date', example: '2025-06-13' },
                startTime: { type: 'string', format: 'date-time', example: '2025-06-13T09:00:00' },
                endTime:   { type: 'string', format: 'date-time', example: '2025-06-13T11:00:00' },
            },
        },
    })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateExamDto,
        @CurrentUser() teacher: TeacherEntity,
    ) {
        return this.serverExamService.update(id, dto, teacher);
    }

    @Delete(':id')
    @HttpCode(204)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER, UserRole.SECRETARY)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number })
    remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() teacher: TeacherEntity) {
        return this.serverExamService.remove(id, teacher);
    }

    @Post('populate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY)
    @ApiBearerAuth()
    seed() {
        return this.serverExamService.seed();
    }
}
