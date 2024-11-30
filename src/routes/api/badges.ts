import { Router } from 'express';
import { BadgeService } from '../../services';

const router = Router();
const badgeService = new BadgeService();

router.post('/', async (req, res, next) => {
  try {
    const result = await badgeService.createBadge(req.body);
    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
});
router.get('/', async (req, res, next) => {
  try {
    const badges = await badgeService.getAllBadges();
    res.json({
      status: 'success',
      data: badges
    });
  } catch (error) {
    next(error);
  }
})
router.get('/:badgeId/progress/:userId', async (req, res, next) => {
  try {
    const progress = await badgeService.getBadgeProgress(
      req.params.userId,
      req.params.badgeId
    );
    res.json({
      status: 'success',
      data: progress
    });
  } catch (error) {
    next(error);
  }
});

export { router as badgeRoutes };