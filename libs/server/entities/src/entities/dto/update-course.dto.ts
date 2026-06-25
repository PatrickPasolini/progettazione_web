import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateCourseDto {
    @IsString()
    @IsOptional()
    courseName?: string;

    @IsInt()
    @IsOptional()
    teacherId?: number;

    @IsInt()
    @IsOptional()
    degreeId?: number;
}
