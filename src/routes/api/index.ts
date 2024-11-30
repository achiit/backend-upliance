import { Router } from 'express';
import { badgeRoutes } from './badges';
import { sessionRoutes } from './sessions';
import { categoryRoutes } from './categories';

const router = Router();

router.use('/badges', badgeRoutes);
router.use('/sessions', sessionRoutes);
router.use('/catergories', categoryRoutes);

export { router as apiRoutes };