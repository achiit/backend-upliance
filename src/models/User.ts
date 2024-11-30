import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class User extends Model {
  public id!: string;
  public nickName!: string;
  public totalXp!: number;
}

User.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true
  },
  nickName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  totalXp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  tableName: 'users'
});

export { User };