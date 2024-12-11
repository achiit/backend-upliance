import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('user_streaks', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    currentStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastSessionDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    streakFreezes: {
      type: DataTypes.INTEGER,
      defaultValue: 5
    },
    freezesLastReset: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    longestStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

  await queryInterface.addIndex('user_streaks', ['userId']);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('user_streaks');
}