import { QueryInterface, DataTypes } from 'sequelize';

export const name = 'add-badge-fields';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.addColumn('badges', 'isSeasoned', {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  });
  
  await queryInterface.addColumn('badges', 'imageUrl', {
    type: DataTypes.STRING,
    allowNull: true
  });
  
  await queryInterface.addColumn('badges', 'activeFrom', {
    type: DataTypes.DATE,
    allowNull: true
  });
  
  await queryInterface.addColumn('badges', 'activeTill', {
    type: DataTypes.DATE,
    allowNull: true
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.removeColumn('badges', 'isSeasoned');
  await queryInterface.removeColumn('badges', 'imageUrl');
  await queryInterface.removeColumn('badges', 'activeFrom');
  await queryInterface.removeColumn('badges', 'activeTill');
} 