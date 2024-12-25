import { Sequelize } from 'sequelize';
import { runMigrations } from '../config/migrations';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true, // Enable SSL for production databases
        rejectUnauthorized: false, // Adjust based on your SSL setup
      },
    },
  });

async function migrate() {
  try {
    await runMigrations(sequelize);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate(); 