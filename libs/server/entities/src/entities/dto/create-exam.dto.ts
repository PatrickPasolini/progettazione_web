import { IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateExamDto {
    @IsInt()
    @IsNotEmpty()
    sessionId: number;

    @IsInt()
    @IsNotEmpty()
    courseId: number;

    @IsInt()
    @IsNotEmpty()
    degreeId: number;

    @IsDateString()
    @IsNotEmpty()
    examDate: string;

    @IsDateString()
    @IsNotEmpty()
    startTime: string;

    @IsDateString()
    @IsNotEmpty()
    endTime: string;
}
