import {
  BelongsToMany,
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';

import { Redemption } from './redemption.model';
import { Reward } from './reward.model';
import { StoreUser } from './stores_users.model';
import { Transaction } from './transaction.model';
import { User } from './users.model';

@Table({
  tableName: 'stores',
  underscored: true,
  timestamps: true,
})
export class Store extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  name: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  isApproved: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  isActive: boolean;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  isVerify: boolean;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    allowNull: true,
  })
  rewards: number[];

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  otpCode: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expiredAt: Date;

  @HasMany(() => Reward)
  rewardsList: Reward[];

  @BelongsToMany(() => User, () => StoreUser)
  users: User[];

  @HasMany(() => Transaction)
  transactions: Transaction[];

  @HasMany(() => Redemption)
  redemptions: Redemption[];
}
