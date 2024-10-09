import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { User } from './users.model';

@Table({
  tableName: 'user_rank_history',
  underscored: true,
  timestamps: true,
})
export class UserRankHistory extends Model {
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

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  rankBefore: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  rankNow: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  pointsNow: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  changedAt: Date;

  @BelongsTo(() => User)
  users: User;
}
