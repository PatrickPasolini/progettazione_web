import { Controller, UseGuards, Post, Patch, Request, Body, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { ServerAuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard, CurrentUser } from '@server/security';
import { UserRole } from '@server/users';

type RequestWithUser = Request & {
  user: AuthenticatedUser;
};

@ApiTags('Auth APIs')
@Controller('auth')
export class ServerAuthController {
  constructor(private serverAuthService: ServerAuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({
          schema: {
              type: 'object',
              properties: {
                  email: { type: 'string', example: 'patrick.pasolini@unibs.it' },
                  password: {type: 'string', example: 'Password1!'}
              },
              required: ['email', 'password'],
          },
      })
  login(@Request() req: RequestWithUser) {
    return this.serverAuthService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body(ValidationPipe) dto: ChangePasswordDto,
  ) {
    return this.serverAuthService.changePassword(user.id, dto.newPassword);
  }

  @Post('register')
  @ApiBody({
          schema: {
              type: 'object',
              properties: {
                  name: { type: 'string', example: 'Devis' },
                  surname: { type: 'string', example: 'Bianchini' },
                  email: { type: 'string', example: 'devis.bianchini@unibs.it' },
                  password: {type: 'string', example: 'Password1!'},
                  role: { type: 'string', enum: Object.values(UserRole), example: UserRole.TEACHER}
              },
              required: ['name', 'email', 'password', 'role'],
          },
      })
  register(@Body(ValidationPipe) dto: RegisterDto) {
    return this.serverAuthService.register(dto);
  }
}
