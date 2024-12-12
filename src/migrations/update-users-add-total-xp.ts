import { Sequelize, DataTypes } from 'sequelize';

export async function updateUsersAddTotalXp(sequelize: Sequelize) {
  try {
    await sequelize.getQueryInterface().addColumn('users', 'totalXp', {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
    
    console.log('Added totalXp column to users table');
  } catch (error) {
    console.error('Error adding totalXp to users table:', error);
    throw error;
  }
}