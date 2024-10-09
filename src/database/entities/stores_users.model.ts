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
  paranoid: true,
})
export class StoreUser extends Model {
  @ForeignKey(() => Store)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  storeId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @BelongsTo(() => Store)
  stores: Store;

  @BelongsTo(() => User)
  users: User;
}
