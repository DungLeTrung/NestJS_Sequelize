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

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  pointsEarned: number;

  @ForeignKey(() => Transaction)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  transactionId: string;

  @BelongsTo(() => User)
  users: User;

  @BelongsTo(() => Transaction)
  transactions: Transaction;
}
