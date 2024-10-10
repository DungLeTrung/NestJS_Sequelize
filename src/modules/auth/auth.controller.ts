import { Body, Controller, Post } from '@nestjs/common';
import { User } from 'src/database';

import { AuthService } from './auth.service';
import { CreateAdminDto } from './dto/register-admin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create-admin')
  async createAdmin(@Body() createAdminDto: CreateAdminDto): Promise<User> {
    return this.authService.createAdmin(createAdminDto);
  }
}
