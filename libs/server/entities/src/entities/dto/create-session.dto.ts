import { IsArray, IsDateString, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

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

    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    degreeIds?: number[];
}
