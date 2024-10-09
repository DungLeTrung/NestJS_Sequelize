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
  paranoid: true,
})
export class TransactionReward extends Model {
  @ForeignKey(() => Transaction)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  transactionId: string;

  @ForeignKey(() => Reward)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  rewardId: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  rewardName: string;
}
