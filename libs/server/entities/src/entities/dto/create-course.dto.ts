import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    courseName: string;

    @IsInt()
    @IsNotEmpty()
    teacherId: number;

    @IsInt()
    @IsNotEmpty()
    degreeId: number;
}
