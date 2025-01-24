import Queue from 'bull';
import { ProgressTrackingService } from '../services/ProgressTrackingService';

export const cookingSessionQueue = new Queue('cooking-session-queue', {
  redis: {
    url: process.env.REDISCLOUD_URL || 'redis://localhost:6379'
  }
});

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