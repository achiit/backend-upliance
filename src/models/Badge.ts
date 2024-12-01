// import { Model, DataTypes } from 'sequelize';
// import sequelize from '../config/database';

// class Badge extends Model {
//   public id!: string;
//   public name!: string;
//   public description!: string;
//   public totalXp!: number;
// }

// Badge.init({
//   id: {
//     type: DataTypes.UUID,
//     defaultValue: DataTypes.UUIDV4,
//     primaryKey: true
//   },
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   description: {
//     type: DataTypes.TEXT
//   },
//   totalXp: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0
//   }
// }, {
//   sequelize,
//   tableName: 'badges'
// });

// export { Badge };

import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Badge extends Model {
  public id!: string;
  public name!: string;
  public description!: string;
  public totalXp!: number;
}

Badge.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  totalXp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  tableName: 'badges'
});

export { Badge };