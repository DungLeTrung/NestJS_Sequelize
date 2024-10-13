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
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { UserRole } from 'src/constants';
import { CustomRequest, CustomStoreRequest } from 'src/constants/custom.request';
import { Store } from 'src/database';
import { ResponseMessage, Roles } from 'src/utils/decorators/customize';
import { PaginatedResult, PaginateDto } from 'src/utils/decorators/paginate';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtStoreAuthGuard } from '../auth/jwt-store.guard';

import { SendOtpDto } from './dto/send_otp.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { StoresService } from './stores.service';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @ApiOperation({ summary: 'API send OTP' })
  @ApiBody({
    type: SendOtpDto,
    required: true,
    description: 'Send OTP',
  })
  @Post('send-otp')
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    const { email } = sendOtpDto;
    const updatedUser = await this.storesService.sendOtp(email);
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
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<Store> {
    return this.storesService.verifyOtp(verifyOtpDto);
  }

  @ApiOperation({ summary: 'API Approve Store' })
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Post('approve-store')
  async approveStore(@Body('id') id: string): Promise<Store> {
    return this.storesService.approveStore(id);
  }

  @Get(':id')
  @HttpCode(201)
  @ResponseMessage('GET STORE BY ID')
  async getUserById(@Param('id') id: string): Promise<Store> {
    return await this.storesService.findById(id);
  }

  @Get()
  @HttpCode(201)
  @ResponseMessage('LIST STORES')
  async getAll(
    @Query() paginateDto: PaginateDto,
  ): Promise<PaginatedResult<Store>> {
    return await this.storesService.getAll(paginateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(201)
  @ResponseMessage('DELETE STORE')
  async delete(@Param('id') id: string): Promise<string> {
    return await this.storesService.delete(id);
  }

  @UseGuards(JwtStoreAuthGuard)
  @Put(':storeId')
  @HttpCode(201)
  @ResponseMessage('UPDATE STORE')
  async updateStore(
    @Param('storeId') storeId: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @Req() req: CustomStoreRequest,
  ): Promise<Store> {
    const { id } = req.store;
    console.log(req.store);
    return await this.storesService.update(storeId, updateStoreDto, id);
  }
}
