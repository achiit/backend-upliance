import { Router } from 'express';
import { badgeRoutes } from './api/badges';
import { sessionRoutes } from './api/sessions';
import { categoryRoutes } from './api/categories';

const router = Router();

router.use('/badges', badgeRoutes);
router.use('/sessions', sessionRoutes);
router.use('/categories', categoryRoutes);


export { router };