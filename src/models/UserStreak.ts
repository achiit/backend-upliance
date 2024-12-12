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
      type: DataTypes.UUID, // Changed to match User.id
      allowNull: false,
      references: {
        model: 'users', // The table name for the User model
        key: 'id',
      },
      onDelete: 'CASCADE', // Cascade delete when the referenced user is deleted
      onUpdate: 'CASCADE', // Update foreign key on referenced key changes
    },
    currentStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    lastSessionDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    streakFreezes: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      allowNull: false,
    },
    longestStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    dailyTaskCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    lastDailyReset: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'user_streaks',
  }
);

export { UserStreak };
