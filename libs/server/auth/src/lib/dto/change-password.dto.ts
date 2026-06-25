import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    @MinLength(8, { message: 'La password deve contenere almeno 8 caratteri' })
    @Matches(/[A-Z]/, { message: 'La password deve contenere almeno una lettera maiuscola' })
    @Matches(/[?^!#@]/, { message: 'La password deve contenere almeno un simbolo tra ? ^ ! # @' })
    newPassword: string;
}
