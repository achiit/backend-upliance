import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class UserStreak extends Model {
  public id!: string;
  public userId!: string;
  public currentStreak!: number;
  public lastSessionDate!: Date;
  public streakFreezes!: number;
  public freezesLastReset!: Date;
  public longestStreak!: number;
}

UserStreak.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  currentStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastSessionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  streakFreezes: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  freezesLastReset: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  longestStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  tableName: 'user_streaks'
});

export { UserStreak };