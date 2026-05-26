import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    courseName: string;

    @IsInt()
    @IsNotEmpty()
    teacherId: number;

    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    degreeIds?: number[];
}
