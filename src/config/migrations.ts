import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { up as createUserStreaks } from '../migrations/20231205-create-user-streaks';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cooking_game'
});

async function runMigrations() {
  try {
    // Only run the user_streaks migration
    await createUserStreaks(sequelize.getQueryInterface());
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();