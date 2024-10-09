import {
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';

import { Reward } from './reward.model';
import { Store } from './store.model'; // Giả sử Store model được khai báo trong store.model.ts
import { TransactionReward } from './transaction_rewards.model';
import { User } from './users.model';
import { UserPointsHistory } from './users_points_history.model';

@Table({
  tableName: 'transactions',
  underscored: true,
  timestamps: true,
})
export class Transaction extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @ForeignKey(() => Store)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  storeId: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  totalBill: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  pointsUsed: number;

  @HasMany(() => UserPointsHistory)
  pointsHistory: UserPointsHistory[];

  @BelongsToMany(() => Reward, () => TransactionReward)
  rewards: Reward[];
}
