import { Router } from 'express';
import { RecipeCategory } from '../../models/Category';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Get all categories
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await RecipeCategory.findAll({
      where: { isActive: true }
    });
    res.json({
      status: 'success',
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

// Create category (admin only)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await RecipeCategory.create(req.body);
    res.status(201).json({
      status: 'success',
      data: category
    });
  } catch (error) {
    next(error);
  }
});

// Update category (admin only)
// router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const category = await RecipeCategory.findByPk(req.params.id);
//     if (!category) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Category not found'
//       });
//     }
    
//     await category.update(req.body);
//     res.json({
//       status: 'success',
//       data: category
//     });
//   } catch (error) {
//     next(error);
//   }
// });

export { router as categoryRoutes };