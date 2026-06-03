import { IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
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

    @IsInt()
    @Min(1)
    @IsNotEmpty()
    examLimit: number;

    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    degreeIds?: number[];
}
