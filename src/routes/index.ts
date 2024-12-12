import { Router } from 'express';
import { badgeRoutes } from './api/badges';
import { sessionRoutes } from './api/sessions';
import { categoryRoutes } from './api/categories';
import { progressRoutes } from './api/progress';
import { streakRoutes } from './api/streaks';  // Add this import
import leaderboardRouter from './api/leaderboard';  // Add this import



const router = Router();

router.use('/badges', badgeRoutes);
router.use('/sessions', sessionRoutes);
router.use('/categories', categoryRoutes);
router.use('/progress', progressRoutes);  // Add this line
router.use('/streaks', streakRoutes);  // Add this line
router.use('/leaderboard', leaderboardRouter);  // Add this line



export { router };