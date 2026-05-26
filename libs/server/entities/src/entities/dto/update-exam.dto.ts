import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class UpdateExamDto {
    @IsInt()
    @IsOptional()
    courseId?: number;

    @IsInt()
    @IsOptional()
    degreeId?: number;

    @IsDateString()
    @IsOptional()
    examDate?: string;

    @IsDateString()
    @IsOptional()
    startTime?: string;

    @IsDateString()
    @IsOptional()
    endTime?: string;
}
