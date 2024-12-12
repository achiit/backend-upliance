import { Router } from 'express';
import { UserProgressService } from '../../services/UserProgressService';

const router = Router();
const progressService = new UserProgressService();

// Changed from /users/:userId/progress to /:userId
router.get('/:userId', async (req, res, next) => {
  try {
    const progress = await progressService.getUserProgress(req.params.userId);
    res.json({
      status: 'success',
      data: progress
    });
  } catch (error) {
    next(error);
  }
});

export { router as progressRoutes };