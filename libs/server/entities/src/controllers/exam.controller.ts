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
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
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
    findAll(
        @Query('sessionId') sessionId?: string,
        @Query('degreeId') degreeId?: string,
    ) {
        return this.serverExamService.findAll(
            sessionId ? parseInt(sessionId) : undefined,
            degreeId ? parseInt(degreeId) : undefined,
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
    create(@Body() dto: CreateExamDto, @CurrentUser() teacher: TeacherEntity) {
        return this.serverExamService.create(dto, teacher);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number })
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
    @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SECRETARY)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number })
    remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() teacher: TeacherEntity) {
        return this.serverExamService.remove(id, teacher);
    }
}
