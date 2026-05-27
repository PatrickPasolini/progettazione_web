import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DegreeType, DegreeYear, MacroArea } from './degree.enum.js';

export class UpdateDegreeDto {
    @IsString()
    @IsOptional()
    degreeName?: string;

    @IsEnum(DegreeType)
    @IsOptional()
    degreeType?: DegreeType;

    @IsEnum(DegreeYear)
    @IsOptional()
    degreeYear?: DegreeYear;

    @IsEnum(MacroArea)
    @IsOptional()
    macroArea?: MacroArea;
}
