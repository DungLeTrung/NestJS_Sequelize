import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { Reward } from './reward.model';
import { User } from './users.model';
import { Store } from './stores.model';

@Table({
  tableName: 'redemption',
  underscored: true,
  timestamps: true,
})
export class Redemption extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @ForeignKey(() => Reward)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  rewardId: number;

  @ForeignKey(() => Store)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  storeId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quantity: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  pointRewards: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Reward)
  reward: Reward;

  @BelongsTo(() => Store)
  store: Store;
}
