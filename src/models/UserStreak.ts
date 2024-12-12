// import { Model, DataTypes } from 'sequelize';
// import sequelize from '../config/database';

// class UserStreak extends Model {
//   public id!: string;
//   public userId!: string;
//   public currentStreak!: number;
//   public lastSessionDate!: Date;
//   public streakFreezes!: number;
//   public freezesLastReset!: Date;
//   public longestStreak!: number;
// }

// UserStreak.init({
//   id: {
//     type: DataTypes.UUID,
//     defaultValue: DataTypes.UUIDV4,
//     primaryKey: true
//   },
//   userId: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   currentStreak: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0
//   },
//   lastSessionDate: {
//     type: DataTypes.DATE,
//     allowNull: true
//   },
//   streakFreezes: {
//     type: DataTypes.INTEGER,
//     defaultValue: 5
//   },
//   freezesLastReset: {
//     type: DataTypes.DATE,
//     defaultValue: DataTypes.NOW
//   },
//   longestStreak: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0
//   }
// }, {
//   sequelize,
//   tableName: 'user_streaks'
// });

// export { UserStreak };

import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class UserStreak extends Model {
  public id!: string;
  public userId!: string;
  public currentStreak!: number;
  public lastSessionDate!: Date | null;
  public streakFreezes!: number;
  public longestStreak!: number;
  public dailyTaskCompleted!: boolean;
  public lastDailyReset!: Date | null;

  // Optional Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserStreak.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currentStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    lastSessionDate: {
      type: DataTypes.DATE,
      allowNull: true, // Null when no session has been logged yet
    },
    streakFreezes: {
      type: DataTypes.INTEGER,
      defaultValue: 5, // Initial default freezes
      allowNull: false,
    },
    longestStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    dailyTaskCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Default to incomplete
      allowNull: false,
    },
    lastDailyReset: {
      type: DataTypes.DATE,
      allowNull: true, // Tracks the last daily reset time
    },
  },
  {
    sequelize, // The Sequelize instance
    tableName: 'user_streaks', // Corresponding table name
  }
);

export { UserStreak };
