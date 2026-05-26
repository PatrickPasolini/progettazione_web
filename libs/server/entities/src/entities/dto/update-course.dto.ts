import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateCourseDto {
    @IsString()
    @IsOptional()
    courseName?: string;

    @IsInt()
    @IsOptional()
    teacherId?: number;

    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    degreeIds?: number[];
}
