import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { Transaction } from './transaction.model';
import { User } from './users.model';

@Table({
  tableName: 'user_points_history',
  underscored: true,
  timestamps: true,
})
export class UserPointsHistory extends Model {
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
  })
  userId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  pointsEarned: number;

  @ForeignKey(() => Transaction)
  @Column({
    type: DataType.INTEGER,
  })
  transactionId: number;

  @BelongsTo(() => User)
  users: User;

  @BelongsTo(() => Transaction)
  transactions: Transaction;
}
