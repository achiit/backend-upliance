import { Router } from 'express';
import { ProgressTrackingService } from '../../services';

const router = Router();
const progressService = new ProgressTrackingService();

router.post('/log', async (req, res, next) => {
  try {
    const result = await progressService.processSession(req.body);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

export { router as sessionRoutes };