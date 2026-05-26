import { IsArray, IsDateString, IsInt, IsOptional } from 'class-validator';

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

    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    degreeIds?: number[];
}
