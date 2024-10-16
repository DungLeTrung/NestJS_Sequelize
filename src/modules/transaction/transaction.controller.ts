import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from 'src/constants';
import {
  CustomRequest,
  CustomStoreRequest,
} from 'src/constants/custom.request';
import { Transaction } from 'src/database';
import { ResponseMessage, Roles } from 'src/utils/decorators/customize';
import { PaginatedResult, PaginateDto } from 'src/utils/decorators/paginate';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtStoreAuthGuard } from '../auth/jwt-store.guard';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ResponseMessage('CREATE TRANSACTION')
  @HttpCode(201)
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(createTransactionDto);
  }

  @UseGuards(JwtStoreAuthGuard)
  @Get('stores')
  @HttpCode(201)
  @ResponseMessage('LIST TRANSACTIONS OF STORE')
  async listTransactionsforStore(
    @Req() req: CustomStoreRequest,
    @Query() paginateDto: PaginateDto,
  ): Promise<PaginatedResult<Transaction>> {
    const { id: storeId } = req.store;
    return await this.transactionService.listTransactionsforStore(
      storeId,
      paginateDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/users/')
  @HttpCode(201)
  @ResponseMessage('LIST TRANSACTIONS OF USER')
  async listTransactionsforUsers(
    @Req() req: CustomRequest,
    @Query() paginateDto: PaginateDto,
  ): Promise<PaginatedResult<Transaction>> {
    const { id: userId } = req.user;
    return await this.transactionService.listTransactionsforUsers(
      userId,
      paginateDto,
    );
  }
}
