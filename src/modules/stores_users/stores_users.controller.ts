import { Controller } from '@nestjs/common';

import { StoresUsersService } from './stores_users.service';

@Controller('stores-users')
export class StoresUsersController {
  constructor(private readonly storesUsersService: StoresUsersService) {}
}
