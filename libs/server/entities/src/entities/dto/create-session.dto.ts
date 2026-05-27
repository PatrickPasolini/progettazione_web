import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { MacroArea } from './degree.enum.js';

export class CreateSessionDto {
    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsNotEmpty()
    endDate: string;

    @IsDateString()
    @IsNotEmpty()
    startInsertDate: string;

    @IsDateString()
    @IsNotEmpty()
    endInsertDate: string;

    @IsEnum(MacroArea)
    @IsNotEmpty()
    macroArea: MacroArea;

    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    degreeIds?: number[];
}
