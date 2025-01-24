import BeeQueue from 'bee-queue';
import { ProgressTrackingService } from '../services/ProgressTrackingService';

// Initialize Bee-Queue
export const cookingSessionQueue = new BeeQueue('cooking-session-queue', {
  redis: {
    host: 'redis-17273.c11.us-east-1-2.ec2.redns.redis-cloud.com',
    port: 17273,
    password: '7ACmQ97msUqWkgsye3tlvGPVvDv5ROoG',
  },
});

// Process jobs in the queue
cookingSessionQueue.process(async (job) => {
  console.log('→ [cooking-session-queue] Processing job:', job.id);
  console.log('   Job data:', JSON.stringify(job.data));

  const progressTrackingService = new ProgressTrackingService();

  try {
    const result = await progressTrackingService.processSession(job.data);
    console.log('→ [cooking-session-queue] Finished job:', job.id);
    return result;
  } catch (err) {
    console.error('→ [cooking-session-queue] Job failed:', job.id, err);
    throw err;
  }
});

// Log queue events
cookingSessionQueue.on('ready', () => {
  console.log('→ [cooking-session-queue] Successfully connected and ready.');
});

console.log('→ [cooking-session-queue] Worker is ready to process jobs.');

