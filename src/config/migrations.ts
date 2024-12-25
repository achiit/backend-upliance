import { Sequelize, QueryInterface } from 'sequelize';
import logger from '../utils/logger';
import * as addBadgeFields from '../config/add-badge-fields';

interface Migration {
  name: string;
  up: (queryInterface: QueryInterface) => Promise<void>;
  down: (queryInterface: QueryInterface) => Promise<void>;
}

const migrations: Migration[] = [
  addBadgeFields as Migration
  // Add other migrations here in chronological order
];

export async function runMigrations(sequelize: Sequelize) {
  try {
    // First ensure database connection is established
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    const queryInterface = sequelize.getQueryInterface();
    
    for (const migration of migrations) {
      logger.info(`Running migration: ${migration.name}`);
      await migration.up(queryInterface);
      logger.info(`Successfully completed migration: ${migration.name}`);
    }
    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}

export async function rollbackMigrations(sequelize: Sequelize) {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    for (const migration of migrations.reverse()) {
      logger.info(`Rolling back migration: ${migration.name}`);
      await migration.down(queryInterface);
      logger.info(`Successfully rolled back migration: ${migration.name}`);
    }
    logger.info('All migrations rolled back successfully');
  } catch (error) {
    logger.error('Migration rollback failed:', error);
    throw error;
  }
}