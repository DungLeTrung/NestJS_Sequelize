import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';

import { User } from './index'; 

@Table({
  tableName: 'ranks',
  underscored: true,
  timestamps: true,
})
export class Rank extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  requiredPoints: number;

  @Column({
    type: DataType.INTEGER,
  })
  amount: number;

  @Column({
    type: DataType.INTEGER,
  })
  fixedPoints: number;

  @Column({
    type: DataType.INTEGER,
  })
  percentagePoints: number;

  @Column({
    type: DataType.INTEGER,
  })
  maxPercentagePoints: number;

  @HasMany(() => User)
  users: User[];
}
