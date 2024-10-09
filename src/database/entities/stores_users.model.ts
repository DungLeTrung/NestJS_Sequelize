import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { Store } from './store.model';
import { User } from './users.model';

@Table({
  tableName: 'store_users',
  underscored: true,
  timestamps: true,
})
export class StoreUser extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  id: number;

  @ForeignKey(() => Store)
  @Column({
    type: DataType.INTEGER,
  })
  storeId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
  })
  userId: number;

  @BelongsTo(() => Store)
  stores: Store;

  @BelongsTo(() => User)
  users: User;
}
