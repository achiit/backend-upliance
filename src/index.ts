import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cron from 'node-cron';
import { apiKeyAuth, errorHandler } from './middleware';
import sequelize from './config/database';
import logger from './utils/logger';
import { router as routes } from './routes';
import dotenv from 'dotenv';
import { StreakManager } from './services/StreakManagerService';

// Load environment variables
dotenv.config();

const app = express();
const streakManager = new StreakManager();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));
app.use(helmet());
app.use(express.json());

// API Key Authentication
app.use(apiKeyAuth);

// Routes
app.use('/api', routes);

// Error Handler
app.use(errorHandler);

// Initialize Cron Jobs
const initializeCronJobs = () => {
  // Run at midnight (00:00) every day
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Starting midnight streak processing...');
      await streakManager.processMidnightCheck();
      logger.info('Midnight streak processing completed successfully');
    } catch (error) {
      logger.error('Error in midnight streak processing:', error);
    }
  });

  // Optional: Run at the start of each month (midnight of 1st day)
  cron.schedule('0 0 1 * *', async () => {
    try {
      logger.info('Starting monthly streak freeze reset...');
      // Add monthly reset logic here if needed
      logger.info('Monthly streak freeze reset completed');
    } catch (error) {
      logger.error('Error in monthly streak freeze reset:', error);
    }
  });
};

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    
    // Initialize cron jobs after database connection is established
    initializeCronJobs();
    
    logger.info(`⚡️[server]: Server is running at http://localhost:${PORT}`);
    logger.info('Cron jobs initialized for streak processing');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Starting graceful shutdown...');
  await new Promise(resolve => server.close(resolve));
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Starting graceful shutdown...');
  await new Promise(resolve => server.close(resolve));
  await sequelize.close();
  process.exit(0);
});

export { app, server };