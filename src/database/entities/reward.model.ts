import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';

import { Store } from './stores.model';
import { Redemption } from './redemption.model';

@Table({
  tableName: 'rewards',
  underscored: true,
  timestamps: true,
})
export class Reward extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  id: number;

  @ForeignKey(() => Store)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  storeId: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  pointsRequired: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quantity: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  imageUrl: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expiredAt: Date;

  @BelongsTo(() => Store)
  stores: Store;

  @HasMany(() => Redemption) 
  redemptions: Redemption[];
}
