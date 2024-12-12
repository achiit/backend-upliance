import cron from 'node-cron';
import { StreakManager } from './src/services'

const streakManager = new StreakManager();

// Run at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
  console.log('Running midnight streak check...');
  try {
    await streakManager.processMidnightCheck();
    console.log('Midnight streak check completed');
  } catch (error) {
    console.error('Error in midnight streak check:', error);
  }
});