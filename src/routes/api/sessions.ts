import { Router } from 'express';
import { cookingSessionQueue } from '../../workers/cookingSessionQueue';

const router = Router();

router.post('/log', async (req, res) => {
  try {
    console.log('→ [POST /api/sessions/log] Request received.');

    // Enqueue the session data.
    const sessionData = req.body;

    // The "await" here only waits for the job to be enqueued, not for processing.
    await cookingSessionQueue.createJob(sessionData).save();    console.log('→ Job enqueued successfully.');

    // Immediately return a 202 Accepted response to the client.
    return res.status(202).json({ message: 'Session queued for background processing' });
  } catch (error) {
    console.error('→ Error adding job to queue:', error);
    return res.status(500).json({ error: 'Unable to queue session' });
  }
});

export { router as sessionRoutes };