import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class RecipeCategory extends Model {
  public id!: number;
  public name!: string;
  public type!: string;  // 'meal_type' | 'cuisine' | 'category'
  public isActive!: boolean;
}

RecipeCategory.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'category'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  tableName: 'recipe_categories'
});

export { RecipeCategory };