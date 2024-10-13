import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { UserRole } from 'src/constants';

import {
  Rank,
  Reward,
  Store,
  StoreUser,
  Transaction,
  UserPointsHistory,
  UserRankHistory,
  UserReward,
} from './index';

@Table({
  tableName: 'users',
  underscored: true,
  timestamps: true,
})
export class User extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  id: number;

  @Default(UserRole.USER)
  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
  })
  role: UserRole;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  username: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    unique: true,
  })
  phoneNumber: string;

  @ForeignKey(() => Rank)
  @Column({
    type: DataType.INTEGER,
  })
  rankId: number;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  isActive: boolean;

  @Column({
    type: DataType.STRING(255),
  })
  firstName: string;

  @Column({
    type: DataType.STRING(255),
  })
  lastName: string;

  @Column({
    type: DataType.STRING(255),
  })
  otpCode: string;

  @Column({
    type: DataType.DATE,
  })
  expiredAt: Date;

  @BelongsTo(() => Rank)
  rank: Rank;

  @BelongsToMany(() => Store, () => StoreUser)
  stores: Store[];

  @BelongsToMany(() => Reward, () => UserReward)
  rewards: Reward[];

  @HasMany(() => UserRankHistory)
  rankHistories: UserRankHistory[];

  @HasMany(() => UserPointsHistory)
  pointsHistory: UserPointsHistory[];

  @HasMany(() => Transaction)
  transactions: Transaction[];

  toJSON() {
    const values = { ...this.get() };
    delete values.password; 
    return values;
  }
}
