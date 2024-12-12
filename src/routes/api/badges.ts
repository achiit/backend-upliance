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
router.get('/active', async (req, res, next) => {
  try {
    const badges = await badgeService.getActiveBadges();
    res.json({
      status: 'success',
      data: badges
    });
  } catch (error) {
    next(error);
  }
});
router.patch('/:badgeId/toggle', async (req, res, next) => {
  try {
    const badge = await badgeService.toggleBadgeStatus(req.params.badgeId);
    res.json({
      status: 'success',
      data: badge
    });
  } catch (error) {
    next(error);
  }
});
export { router as badgeRoutes };