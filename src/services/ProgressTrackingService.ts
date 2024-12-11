

// import { Transaction } from 'sequelize';
// import { Badge, BadgeSubtask, UserProgress, User } from '../models';
// import { RequirementRule } from '../models/BadgeSubtask';

// interface CookingSession {
//   user: {
//     id: string;
//     nickName: string;
//   };
//   sessionRecipe: {
//     id: string;
//     diet: string[];
//     cuisine: string[];
//     created_source: string;
//     meal_type: string[];
//     Recipe_Categories_Map: Array<{
//       recipe_category: {
//         id: number;
//         name: string;
//       };
//     }>;
//   };
// }

// export class ProgressTrackingService {
//   async processSession(session: CookingSession) {
//     const transaction = await Badge.sequelize!.transaction();
//     const progressUpdates: any[] = [];
//     let totalXpEarned = 0;

//     try {
//       // Get or create user
//       let user = await User.findByPk(session.user.id);
//       if (!user) {
//         user = await User.create({
//           id: session.user.id,
//           nickName: session.user.nickName,
//           totalXp: 0
//         }, { transaction });
//       }

//       // Get all badges with their subtasks
//       const badges = await Badge.findAll({
//         where: { isActive: true },  // Only get active badges
//         include: [BadgeSubtask]
//       });

//       for (const badge of badges) {
//         const badgeData = badge.get({ plain: true });
        
//         // Process each subtask
//         for (const subtask of badgeData.BadgeSubtasks || []) {
//           // Check if the session matches this subtask's requirements
//           if (this.doesSessionMatchSubtask(session.sessionRecipe, subtask)) {
//             let progress = await UserProgress.findOne({
//               where: {
//                 userId: session.user.id,
//                 subtaskId: subtask.id
//               },
//               transaction
//             });

//             if (!progress) {
//               progress = await UserProgress.create({
//                 userId: session.user.id,
//                 subtaskId: subtask.id,
//                 currentCount: 0,
//                 completed: false
//               }, { transaction });
//             }

//             // Only update if not already completed
//             if (!progress.get('completed')) {
//               const currentCount = progress.get('currentCount') as number;
//               const newCount = currentCount + 1;
//               const isNowCompleted = newCount >= subtask.requiredCount;

//               // Calculate XP earned if just completed
//               const xpEarned = isNowCompleted ? (subtask.xpPerCompletion * subtask.requiredCount) : 0;
//               totalXpEarned += xpEarned;

//               await progress.update({
//                 currentCount: newCount,
//                 completed: isNowCompleted,
//                 completedAt: isNowCompleted ? new Date() : null
//               }, { transaction });

//               progressUpdates.push({
//                 subtaskId: subtask.id,
//                 badgeName: badgeData.name,
//                 subtaskDescription: subtask.description,
//                 previousCount: currentCount,
//                 newCount,
//                 requiredCount: subtask.requiredCount,
//                 completed: isNowCompleted,
//                 xpEarned
//               });
//             }
//           }
//         }
//       }

//       // Update user's total XP
//       if (totalXpEarned > 0) {
//         await user.increment('totalXp', {
//           by: totalXpEarned,
//           transaction
//         });
//       }

//       await transaction.commit();

//       return {
//         sessionSummary: {
//           userId: session.user.id,
//           totalXpEarned,
//           updatedUserXp: (user.get('totalXp') as number) + totalXpEarned,
//           progressUpdates: progressUpdates.map(update => ({
//             badge: update.badgeName,
//             subtask: update.subtaskDescription,
//             progress: `${update.newCount}/${update.requiredCount}`,
//             completed: update.completed,
//             xpEarned: update.xpEarned
//           }))
//         },
//         details: progressUpdates
//       };

//     } catch (error) {
//       if (transaction && !transaction.afterCommit) {
//         await transaction.rollback();
//       }
//       throw error;
//     }
//   }

//   private doesSessionMatchSubtask(recipe: CookingSession['sessionRecipe'], subtask: any): boolean {
//     // Parse rules if they're stored as a string
//     let rules: RequirementRule[] = [];
//     try {
//       if (typeof subtask.requirementRules === 'string') {
//         rules = JSON.parse(subtask.requirementRules);
//       } else if (Array.isArray(subtask.requirementRules)) {
//         rules = subtask.requirementRules;
//       } else {
//         console.log('Unexpected requirementRules format:', subtask.requirementRules);
//         return false;
//       }
//     } catch (error) {
//       console.error('Error parsing requirementRules:', error);
//       return false;
//     }
    
//     // If no rules, match anything
//     if (!rules || rules.length === 0) {
//       return true;
//     }

//     // Check each rule
//     return rules.every((rule: RequirementRule) => {
//       try {
//         switch (rule.field) {
//           case 'category':
//             const recipeCategories = recipe.Recipe_Categories_Map?.map(cat => cat.recipe_category.id) || [];
//             return rule.values?.some(id => recipeCategories.includes(id)) || false;

//           case 'meal_type':
//             return rule.stringValues?.some(type => recipe.meal_type?.includes(type)) || false;

//           case 'diet':
//             return rule.stringValues?.some(diet => recipe.diet?.includes(diet)) || false;

//           case 'cuisine':
//             return rule.stringValues?.some(cuisine => recipe.cuisine?.includes(cuisine)) || false;

//           case 'created_source':
//             return rule.stringValues?.includes(recipe.created_source) || false;

//           default:
//             console.log('Unknown rule field:', rule.field);
//             return false;
//         }
//       } catch (error) {
//         console.error('Error processing rule:', rule, error);
//         return false;
//       }
//     });
//   }
// }

import { Transaction } from 'sequelize';
import { Badge, BadgeSubtask, UserProgress, User } from '../models';
import { StreakService } from './StreakService';

interface CookingSession {
  user: {
    id: string;
    nickName: string;
  };
  sessionRecipe: {
    id: string;
    diet: string[];
    cuisine: string[];
    created_source: string;
    meal_type: string[];
    Recipe_Categories_Map: Array<{
      recipe_category: {
        id: number;
        name: string;
      };
    }>;
  };
  startTime?: string;
  endTime?: string;
}

interface ProgressUpdate {
  subtaskId: string;
  badgeName: string;
  subtaskDescription: string;
  previousCount: number;
  newCount: number;
  requiredCount: number;
  completed: boolean;
  xpEarned: number;
}

export class ProgressTrackingService {
  private streakService: StreakService;

  constructor() {
    this.streakService = new StreakService();
  }

  async processSession(session: CookingSession) {
    const transaction = await Badge.sequelize!.transaction();
    const progressUpdates: ProgressUpdate[] = [];
    let totalXpEarned = 0;

    try {
      // Get or create user
      let user = await User.findByPk(session.user.id);
      if (!user) {
        user = await User.create({
          id: session.user.id,
          nickName: session.user.nickName,
          totalXp: 0
        }, { transaction });
      }

      // Get active badges with their subtasks
      const badges = await Badge.findAll({
        where: { isActive: true },
        include: [BadgeSubtask]
      });

      // Process each badge
      for (const badge of badges) {
        const badgeData = badge.get({ plain: true });
        
        // Process each subtask
        for (const subtask of badgeData.BadgeSubtasks || []) {
          // Check if the session matches this subtask's requirements
          if (this.doesSessionMatchSubtask(session.sessionRecipe, subtask)) {
            let progress = await UserProgress.findOne({
              where: {
                userId: session.user.id,
                subtaskId: subtask.id
              },
              transaction
            });

            if (!progress) {
              progress = await UserProgress.create({
                userId: session.user.id,
                subtaskId: subtask.id,
                currentCount: 0,
                completed: false
              }, { transaction });
            }

            // Only update if not already completed
            if (!progress.get('completed')) {
              const currentCount = progress.get('currentCount') as number;
              const newCount = currentCount + 1;
              const isNowCompleted = newCount >= subtask.requiredCount;

              // Calculate XP earned if just completed
              const xpEarned = isNowCompleted ? (subtask.xpPerCompletion * subtask.requiredCount) : 0;
              totalXpEarned += xpEarned;

              await progress.update({
                currentCount: newCount,
                completed: isNowCompleted,
                completedAt: isNowCompleted ? new Date() : null
              }, { transaction });

              progressUpdates.push({
                subtaskId: subtask.id,
                badgeName: badgeData.name,
                subtaskDescription: subtask.description,
                previousCount: currentCount,
                newCount,
                requiredCount: subtask.requiredCount,
                completed: isNowCompleted,
                xpEarned
              });
            }
          }
        }
      }

      // Process streak
      const streakResult = await this.streakService.processSession(
        session.user.id,
        session.endTime ? new Date(session.endTime) : new Date(),
        transaction
      );

      // Add streak XP to total
      totalXpEarned += streakResult.xpEarned;

      // Update user's total XP
      if (totalXpEarned > 0) {
        await user.increment('totalXp', {
          by: totalXpEarned,
          transaction
        });
      }

      await transaction.commit();

      // Get final user state
      const updatedUser = await User.findByPk(session.user.id);

      return {
        sessionSummary: {
          userId: session.user.id,
          totalXpEarned,
          updatedUserXp: updatedUser?.get('totalXp') || 0,
          progressUpdates: progressUpdates.map(update => ({
            badge: update.badgeName,
            subtask: update.subtaskDescription,
            progress: `${update.newCount}/${update.requiredCount}`,
            completed: update.completed,
            xpEarned: update.xpEarned
          }))
        },
        streakProgress: {
          currentStreak: streakResult.currentStreak,
          streakFreezes: streakResult.streakFreezes,
          streakXpEarned: streakResult.xpEarned,
          isStreakMaintained: streakResult.isStreakMaintained,
          usedFreeze: streakResult.usedFreeze,
          longestStreak: streakResult.longestStreak
        },
        details: progressUpdates
      };

    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  private doesSessionMatchSubtask(recipe: CookingSession['sessionRecipe'], subtask: any): boolean {
    const rules = subtask.requirementRules || [];
    
    if (rules.length === 0) {
      return true;
    }

    return rules.every(rule => {
      try {
        switch (rule.field) {
          case 'category':
            return recipe.Recipe_Categories_Map.some(
              cat => rule.values?.includes(cat.recipe_category.id)
            );

          case 'meal_type':
            return recipe.meal_type.some(
              type => rule.stringValues?.includes(type)
            );

          case 'diet':
            return recipe.diet.some(
              diet => rule.stringValues?.includes(diet)
            );

          case 'cuisine':
            return recipe.cuisine.some(
              cuisine => rule.stringValues?.includes(cuisine)
            );

          case 'created_source':
            return rule.stringValues?.includes(recipe.created_source);

          default:
            console.log('Unknown rule field:', rule.field);
            return false;
        }
      } catch (error) {
        console.error('Error processing rule:', rule, error);
        return false;
      }
    });
  }
}