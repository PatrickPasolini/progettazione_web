import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    @MinLength(8)
    @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    @Matches(/[?^!#@]/, { message: 'Password must contain at least one symbol among ? ^ ! # @' })
    newPassword: string;
}
