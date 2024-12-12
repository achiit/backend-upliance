import { Router } from 'express';
import { StreakService } from '../../services/StreakService';
import { StreakManager } from '../../services/StreakManagerService';

const router = Router();
const streakService = new StreakService();
const streakManager = new StreakManager();

// Put specific routes before parameterized routes
router.post('/process-midnight', async (req, res, next) => {
  try {
    const result = await streakManager.processMidnightCheck();
    res.json({
      status: 'success',
      data: {
        processed: result
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/logs/today', async (req, res, next) => {
  try {
    const logs = await streakManager.getTodayLogs();
    res.json({
      status: 'success',
      data: logs
    });
  } catch (error) {
    next(error);
  }
});

// // User specific routes
// router.get('/:userId', async (req, res, next) => {
//   try {
//     const streakInfo = await streakService.getStreakInfo(req.params.userId);
//     res.json({
//       status: 'success',
//       data: {
//         userId: req.params.userId,
//         streak: streakInfo
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// });

export { router as streakRoutes };
