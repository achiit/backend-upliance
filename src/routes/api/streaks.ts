import { Router } from 'express';
import { StreakService } from '../../services/StreakService';

const router = Router();
const streakService = new StreakService();

router.get('/:userId', async (req, res, next) => {
  try {
    const streakInfo = await streakService.getStreakInfo(req.params.userId);
    res.json({
      status: 'success',
      data: streakInfo
    });
  } catch (error) {
    next(error);
  }
});

export { router as streakRoutes };