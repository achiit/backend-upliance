import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class UserProgress extends Model {
  public id!: string;
  public userId!: string;
  public subtaskId!: string;
  public currentCount!: number;
  public completed!: boolean;
  public completedAt?: Date;
}

UserProgress.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  subtaskId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  currentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completedAt: {
    type: DataTypes.DATE
  }
}, {
  sequelize,
  tableName: 'user_progress'
});

export { UserProgress };