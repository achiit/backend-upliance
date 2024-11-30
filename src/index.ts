import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { apiKeyAuth, errorHandler } from './middleware';
import sequelize from './config/database';
import logger from './utils/logger';
import { router as routes } from './routes';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// API Key Authentication
app.use(apiKeyAuth);

// Routes

app.use('/api', routes);
// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    logger.info(`⚡️[server]: Server is running at http://localhost:${PORT}`);
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
});

export { app, server };