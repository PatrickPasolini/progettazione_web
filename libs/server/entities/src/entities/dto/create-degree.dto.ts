import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DegreeType, DegreeYear, MacroArea } from './degree.enum.js';

export class CreateDegreeDto {
    @IsString()
    @IsNotEmpty()
    degreeName: string;

    @IsEnum(DegreeType)
    @IsNotEmpty()
    degreeType: DegreeType;

    @IsEnum(DegreeYear)
    @IsNotEmpty()
    degreeYear: DegreeYear;

    @IsEnum(MacroArea)
    @IsNotEmpty()
    macroArea: MacroArea;
}
