// import { Model, DataTypes } from 'sequelize';
// import sequelize from '../config/database';
// import { RecipeCategory } from './Category';

// class BadgeSubtask extends Model {
//   public id!: string;
//   public badgeId!: string;
//   public description!: string;
//   public requiredCount!: number;
//   public xpPerCompletion!: number;
// }

// BadgeSubtask.init({
//   id: {
//     type: DataTypes.UUID,
//     defaultValue: DataTypes.UUIDV4,
//     primaryKey: true
//   },
//   badgeId: {
//     type: DataTypes.UUID,
//     allowNull: false
//   },
//   description: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   requiredCount: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   xpPerCompletion: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   }
// }, {
//   sequelize,
//   tableName: 'badge_subtasks'
// });

// // Create join table for subtasks and categories
// const SubtaskCategory = sequelize.define('subtask_categories', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   subtaskId: {
//     type: DataTypes.UUID,
//     allowNull: false,
//     references: {
//       model: BadgeSubtask,
//       key: 'id'
//     }
//   },
//   categoryId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: RecipeCategory,
//       key: 'id'
//     }
//   }
// });

// // Set up associations
// BadgeSubtask.belongsToMany(RecipeCategory, { 
//   through: SubtaskCategory,
//   foreignKey: 'subtaskId',
//   as: 'categories'
// });

// RecipeCategory.belongsToMany(BadgeSubtask, {
//   through: SubtaskCategory,
//   foreignKey: 'categoryId',
//   as: 'subtasks'
// });

// export { BadgeSubtask, SubtaskCategory };      

import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface RequirementRule {
  field: string;
  values?: number[];
  stringValues?: string[];
}

class BadgeSubtask extends Model {
  public id!: string;
  public badgeId!: string;
  public description!: string;
  public requiredCount!: number;
  public xpPerCompletion!: number;
  public requirementRules!: string | RequirementRule[];
}

BadgeSubtask.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  badgeId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  requiredCount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  xpPerCompletion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  requirementRules: {
    type: DataTypes.TEXT,  // Changed to TEXT to ensure proper JSON storage
    allowNull: false,
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('requirementRules');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value: RequirementRule[]) {
      this.setDataValue('requirementRules', JSON.stringify(value));
    }
  }
}, {
  sequelize,
  tableName: 'badge_subtasks'
});

export { BadgeSubtask };



