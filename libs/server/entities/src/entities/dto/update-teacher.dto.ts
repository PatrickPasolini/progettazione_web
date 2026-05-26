import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateTeacherDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    surname?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    @MinLength(6)
    password?: string;
}
