import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { Store } from './store.model';
import { Transaction } from './transaction.model';
import { TransactionReward } from './transaction_rewards.model';
import { User } from './users.model';
import { UserReward } from './users_rewards.model';

@Table({
  tableName: 'rewards',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class Reward extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Store)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  storeId: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  pointsRequired: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quantity: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  imageUrl: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expiredAt: Date;

  @BelongsToMany(() => User, () => UserReward)
  users: User[];

  @BelongsToMany(() => Transaction, () => TransactionReward)
  transactions: Transaction[];

  @BelongsTo(() => Store)
  stores: Store;
}
