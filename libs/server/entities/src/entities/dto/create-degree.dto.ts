import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DegreeType, DegreeYear } from './degree.enum.js';

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
}
