import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRepository, User } from 'src/database';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(@InjectModel(User) readonly model: typeof User) {
    super(model);
  }
}
