import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/constants';
import { CustomRequest } from 'src/constants/custom.request';
import { User } from 'src/database';
import { ResponseMessage, Roles } from 'src/utils/decorators/customize';
import { PaginatedResult, PaginateDto } from 'src/utils/decorators/paginate';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { SendOtpDto } from './dto/send_otp.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UsersService } from './users.services';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'API send OTP' })
  @ApiBody({
    type: SendOtpDto,
    required: true,
    description: 'Send OTP',
  })
  @Post('send-otp')
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    const { email } = sendOtpDto;
    const updatedUser = await this.usersService.sendOtp(email);
    return {
      message: 'OTP sent successfully',
      data: updatedUser,
    };
  }

  @ApiOperation({ summary: 'API Verify OTP' })
  @ApiBody({
    type: SendOtpDto,
    required: true,
    description: 'Send OTP',
  })
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<User> {
    return this.usersService.verifyOtp(verifyOtpDto);
  }

  @Get()
  @HttpCode(201)
  @ResponseMessage('LIST USERS')
  async getAll(
    @Query() paginateDto: PaginateDto,
  ): Promise<PaginatedResult<User>> {
    return await this.usersService.getAll(paginateDto);
  }

  @Get(':id')
  @HttpCode(201)
  @ResponseMessage('GET USER BY ID')
  async getUserById(@Param('id') id: string): Promise<User> {
    return await this.usersService.findById(id);
  }

  @ApiOperation({ summary: 'API Active Store' })
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Post('active-user/:id')
  async activeUser(@Param('id') id: number): Promise<User> {
    return this.usersService.activeUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':userId')
  @HttpCode(201)
  @ResponseMessage('UPDATE USER')
  async updateUser(
    @Param('userId') userId: string,
      @Body() updateUserDto: UpdateUserDto,
      @Req() req: CustomRequest
  ): Promise<User> {
    const { id } = req.user;
    return await this.usersService.update(userId, updateUserDto, id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(201)
  @ResponseMessage('DELETE USER')
  async delete(@Param('id') id: string): Promise<string> {
    return await this.usersService.delete(id);
  }
}
