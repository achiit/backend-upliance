import { Router } from 'express';
import { badgeRoutes } from './badges';
import { sessionRoutes } from './sessions';
import { categoryRoutes } from './categories';
import { streakRoutes } from './streaks';
import leaderboardRouter from './leaderboard'; // Import the leaderboard router

const router = Router();

router.use('/badges', badgeRoutes);
router.use('/sessions', sessionRoutes);
router.use('/categories', categoryRoutes); // Fixed typo: catergories -> categories
router.use('/streaks', streakRoutes);
router.use('/leaderboard', leaderboardRouter); // Add leaderboard route

export { router as apiRoutes };
