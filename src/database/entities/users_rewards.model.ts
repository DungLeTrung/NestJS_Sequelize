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
  paranoid: true,
})
export class UserReward extends Model {
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

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  redeemedAt: Date;
}
