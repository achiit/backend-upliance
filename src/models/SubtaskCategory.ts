import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class SubtaskCategory extends Model {
  public subtaskId!: string;
  public categoryId!: number;
}

SubtaskCategory.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subtaskId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  tableName: 'subtask_categories'
});

export { SubtaskCategory };