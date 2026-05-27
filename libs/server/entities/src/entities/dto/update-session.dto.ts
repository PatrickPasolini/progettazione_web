import { IsArray, IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { MacroArea } from './degree.enum.js';

export class UpdateSessionDto {
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsDateString()
    @IsOptional()
    startInsertDate?: string;

    @IsDateString()
    @IsOptional()
    endInsertDate?: string;

    @IsEnum(MacroArea)
    @IsOptional()
    macroArea?: MacroArea;

    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    degreeIds?: number[];
}
