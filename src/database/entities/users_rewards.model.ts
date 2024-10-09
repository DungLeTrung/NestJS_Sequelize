import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { Reward } from './reward.model';
import { User } from './users.model';

@Table({
  tableName: 'user_rewards',
  underscored: true,
  timestamps: true,
})
export class UserReward extends Model {
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

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  redeemedAt: Date;
}
