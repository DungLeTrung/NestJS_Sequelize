import {
  Controller,
  Get,
  HttpCode,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CustomStoreRequest } from 'src/constants/custom.request';
import { StoreUser } from 'src/database';
import { ResponseMessage } from 'src/utils/decorators/customize';
import { PaginatedResult, PaginateDto } from 'src/utils/decorators/paginate';

import { JwtStoreAuthGuard } from '../auth/jwt-store.guard';

import { StoresUsersService } from './stores_users.service';

@Controller('stores-users')
export class StoresUsersController {
  constructor(private readonly storesUsersService: StoresUsersService) {}

  @UseGuards(JwtStoreAuthGuard)
  @Get()
  @HttpCode(201)
  @ResponseMessage('LIST USERS OF STORE')
  async listUsers(
    @Req() req: CustomStoreRequest,
    @Query() paginateDto: PaginateDto,
  ): Promise<PaginatedResult<StoreUser>> {
    const { id: storeId } = req.store;
    return await this.storesUsersService.listUsers(storeId, paginateDto);
  }
}
