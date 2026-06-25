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
    @Roles(UserRole.SECRETARY)
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            required: ['degreeName', 'degreeType', 'degreeYear'],
            properties: {
                degreeName: { type: 'string', example: 'Informatica' },
                degreeType: { type: 'string', enum: ['LT', 'LM', 'LMCU'], example: 'LT', description: 'LT = Triennale, LM = Magistrale, LMCU = Ciclo unico' },
                degreeYear: { type: 'string', enum: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'], example: 'I' },
                macroArea:  { type: 'string', enum: ['Agraria','Biotecnologie','Economia','Farmacia','Giurisprudenza','Ingegneria','Medicina','Scienze Motorie','Scienze Politiche e Sociali'], example: 'Ingegneria' },
            },
        },
    })
    create(@Body() dto: CreateDegreeDto) {
        return this.serverDegreeService.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                degreeName: { type: 'string', example: 'Informatica' },
                degreeType: { type: 'string', enum: ['LT', 'LM', 'LMCU'], example: 'LT', description: 'LT = Triennale, LM = Magistrale, LMCU = Ciclo unico' },
                degreeYear: { type: 'string', enum: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'], example: 'I' },
                macroArea:  { type: 'string', enum: ['Agraria','Biotecnologie','Economia','Farmacia','Giurisprudenza','Ingegneria','Medicina','Scienze Motorie','Scienze Politiche e Sociali'], example: 'Ingegneria' },
            },
        },
    })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDegreeDto) {
        return this.serverDegreeService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', type: Number })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.serverDegreeService.remove(id);
    }

    @Post('populate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SECRETARY)
    @ApiBearerAuth()
    seed() {
        return this.serverDegreeService.seed();
    }
}
