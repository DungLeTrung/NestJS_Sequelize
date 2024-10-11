import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { Reward } from './reward.model';
import { Transaction } from './transaction.model';

@Table({
  tableName: 'transaction_rewards',
  underscored: true,
  timestamps: true,
})
export class TransactionReward extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  id: number;

  @ForeignKey(() => Transaction)
  @Column({
    type: DataType.INTEGER,
  })
  transactionId: number;

  @ForeignKey(() => Reward)
  @Column({
    type: DataType.INTEGER,
  })
  rewardId: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  rewardName: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  rewardPoint: number;
}
