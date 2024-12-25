// import { Badge, BadgeSubtask, UserProgress, RecipeCategory, SubtaskCategory } from '../models';
// import { Transaction } from 'sequelize';

// interface SubtaskInput {
//   description: string;
//   requiredCount: number;
//   xpPerCompletion: number;
//   categoryIds: number[];
// }

// interface CreateBadgeDTO {
//   name: string;
//   description: string;
//   subtasks: SubtaskInput[];
// }

// export class BadgeService {
//   async createBadge(badgeData: CreateBadgeDTO) {
//     const transaction = await Badge.sequelize!.transaction();

//     try {
//       // Calculate total XP from all subtasks
//       const totalXp = badgeData.subtasks.reduce(
//         (sum, task) => sum + (task.requiredCount * task.xpPerCompletion),
//         0
//       );

//       // Create the badge
//       const badge = await Badge.create({
//         name: badgeData.name,
//         description: badgeData.description,
//         totalXp
//       }, { transaction });

//       // Create subtasks and their category associations
//       for (const task of badgeData.subtasks) {
//         // Create subtask
//         const subtask = await BadgeSubtask.create({
//           badgeId: badge.get('id'),
//           description: task.description,
//           requiredCount: task.requiredCount,
//           xpPerCompletion: task.xpPerCompletion
//         }, { transaction });

//         // Create category associations if any
//         if (task.categoryIds && task.categoryIds.length > 0) {
//           const categoryAssociations = task.categoryIds.map(categoryId => ({
//             subtaskId: subtask.get('id'),
//             categoryId
//           }));

//           await SubtaskCategory.bulkCreate(categoryAssociations, { transaction });
//         }
//       }

//       // Fetch complete data
//       const completeData = await Badge.findByPk(badge.get('id'), {
//         include: [{
//           model: BadgeSubtask,
//           include: [{
//             model: RecipeCategory,
//             as: 'categories'
//           }]
//         }],
//         transaction
//       });

//       await transaction.commit();
//       return completeData;

//     } catch (error) {
//       if (transaction && !transaction.afterCommit) {
//         await transaction.rollback();
//       }
//       throw error;
//     }
//   }

//   async getBadgeProgress(userId: string, badgeId: string) {
//     const badge = await Badge.findByPk(badgeId, {
//       include: [{
//         model: BadgeSubtask,
//         include: [
//           {
//             model: RecipeCategory,
//             as: 'categories'
//           },
//           {
//             model: UserProgress,
//             where: { userId },
//             required: false
//           }
//         ]
//       }]
//     });

//     if (!badge) {
//       throw new Error('Badge not found');
//     }

//     return badge;
//   }

//   async getAllBadges() {
//     return Badge.findAll({
//       include: [{
//         model: BadgeSubtask,
//         include: [{
//           model: RecipeCategory,
//           as: 'categories'
//         }]
//       }]
//     });
//   }

//   async initializeUserProgress(userId: string, badgeId: string) {
//     const transaction = await Badge.sequelize!.transaction();

//     try {
//       const subtasks = await BadgeSubtask.findAll({
//         where: { badgeId }
//       });

//       await UserProgress.bulkCreate(
//         subtasks.map(subtask => ({
//           userId,
//           subtaskId: subtask.id,
//           currentCount: 0,
//           completed: false
//         })),
//         { transaction }
//       );

//       await transaction.commit();
//     } catch (error) {
//       await transaction.rollback();
//       throw error;
//     }
//   }
// }

import { Badge, BadgeSubtask, RecipeCategory, UserProgress } from '../models';
import { Transaction } from 'sequelize';
import { RequirementRule } from '../models/BadgeSubtask';

interface SubtaskInput {
  description: string;
  requiredCount: number;
  xpPerCompletion: number;
  requirementRules: RequirementRule[];  // Changed from requirements to requirementRules
}

interface CreateBadgeDTO {
  name: string;
  description: string;
  imageUrl: string;
  isSeasoned: boolean;
  activeFrom: Date;
  activeTill: Date;
  subtasks: SubtaskInput[];
}

export class BadgeService {
  async createBadge(badgeData: CreateBadgeDTO) {
    const transaction = await Badge.sequelize!.transaction();

    try {
      const totalXp = badgeData.subtasks.reduce(
        (sum, task) => sum + (task.requiredCount * task.xpPerCompletion),
        0
      );

      const badge = await Badge.create({
        name: badgeData.name,
        description: badgeData.description,
        imageUrl: badgeData.imageUrl,
        isSeasoned: badgeData.isSeasoned??false,
        activeFrom: badgeData.activeFrom??null,
        activeTill: badgeData.activeTill??null,
        totalXp
      }, { transaction });

      const subtasks = await BadgeSubtask.bulkCreate(
        badgeData.subtasks.map(task => ({
          badgeId: badge.get('id'),
          description: task.description,
          requiredCount: task.requiredCount,
          xpPerCompletion: task.xpPerCompletion,
          requirementRules: task.requirementRules  // Changed from requirements to requirementRules
        })),
        { transaction }
      );

      await transaction.commit();

      return await Badge.findByPk(badge.get('id'), {
        include: [BadgeSubtask]
      });

    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }
  async getAllBadges() {
    return Badge.findAll({
      include: [BadgeSubtask],
      order: [['createdAt', 'DESC']]
    });
  }

  async getActiveBadges() {
    return Badge.findAll({
      where: { isActive: true },
      include: [BadgeSubtask],
      order: [['createdAt', 'DESC']]
    });
  }

  async toggleBadgeStatus(badgeId: string) {
    const badge = await Badge.findByPk(badgeId);
    if (!badge) {
      throw new Error('Badge not found');
    }

    await badge.update({
      isActive: !badge.get('isActive')
    });

    return badge;
  }

}