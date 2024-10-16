import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { PointType } from 'src/constants/enums/point.enum';

import { Reward } from './reward.model';
import { Store } from './stores.model';
import { TransactionReward } from './transaction_rewards.model';
import { User } from './users.model';

@Table({
  tableName: 'transactions',
  underscored: true,
  timestamps: true,
})
export class Transaction extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
  })
  userId: number;

  @ForeignKey(() => Store)
  @Column({
    type: DataType.INTEGER,
  })
  storeId: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  totalPayment: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  pointsUsed: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  quantity: number;

  @Column({
    type: DataType.ENUM(...Object.values(PointType)),
    allowNull: true,
  })
  pointType: PointType;

  @BelongsToMany(() => Reward, () => TransactionReward)
  rewards: Reward[];

  @BelongsTo(() => User)
  users: User;

  @BelongsTo(() => Store)
  stores: Store;
}
