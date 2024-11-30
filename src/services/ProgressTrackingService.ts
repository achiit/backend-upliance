import { Transaction } from 'sequelize';
import { Badge, BadgeSubtask, UserProgress, User, RecipeCategory } from '../models';

interface CookingSession {
  user: {
    id: string;
    nickName: string;
  };
  sessionRecipe: {
    Recipe_Categories_Map: Array<{
      recipe_category: {
        id: number;
        name: string;
      };
    }>;
    meal_type: string[];
    diet: string[];
    cuisine: string[];
  };
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
  
        // Get recipe category IDs
        const recipeCategoryIds = session.sessionRecipe.Recipe_Categories_Map.map(
          cat => cat.recipe_category.id
        );
  
        // Get all badges with their subtasks and categories
        const badges = await Badge.findAll({
          include: [{
            model: BadgeSubtask,
            include: [
              {
                model: RecipeCategory,
                as: 'categories'
              }
            ]
          }]
        });
  
        // Process each badge
        for (const badge of badges) {
          const badgeData = badge.get({ plain: true });
          const subtasks = badgeData.BadgeSubtasks || [];
          
          // Check each subtask
          for (const subtask of subtasks) {
            const subtaskCategories = subtask.categories || [];
            const subtaskCategoryIds = subtaskCategories.map(cat => cat.id);
            
            // Only count as a match if:
            // 1. Subtask has no category requirements (matches any dish) OR
            // 2. Recipe has at least one category that matches subtask requirements
            const shouldCount = 
              subtaskCategoryIds.length === 0 || // This is for "Cook any dish" type tasks
              (subtaskCategoryIds.length > 0 && recipeCategoryIds.some(id => subtaskCategoryIds.includes(id)));
  
            if (shouldCount) {
              // Get or create progress record
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
  
              const progressData = progress.get({ plain: true });
  
              // Don't update if already completed
              if (!progressData.completed) {
                const previousCount = progressData.currentCount;
                const newCount = previousCount + 1;
                const requiredCount = subtask.requiredCount;
                const nowCompleted = newCount >= requiredCount;
                
                // Calculate XP earned if completed
                const xpEarned = nowCompleted ? (subtask.xpPerCompletion * requiredCount) : 0;
                totalXpEarned += xpEarned;
  
                // Update progress
                await progress.update({
                  currentCount: newCount,
                  completed: nowCompleted,
                  completedAt: nowCompleted ? new Date() : null
                }, { transaction });
  
                // Track this update
                progressUpdates.push({
                  subtaskId: subtask.id,
                  badgeName: badgeData.name,
                  subtaskDescription: subtask.description,
                  previousCount,
                  newCount,
                  requiredCount,
                  completed: nowCompleted,
                  xpEarned
                });
              }
            }
          }
        }
  
        // Update user's total XP
        if (totalXpEarned > 0) {
          await user.increment('totalXp', {
            by: totalXpEarned,
            transaction
          });
        }
  
        await transaction.commit();
  
        // Return detailed response
        return {
          sessionSummary: {
            userId: session.user.id,
            totalXpEarned,
            updatedUserXp: (user.get('totalXp') as number) + totalXpEarned,
            progressUpdates: progressUpdates.map(update => ({
              badge: update.badgeName,
              subtask: update.subtaskDescription,
              progress: `${update.newCount}/${update.requiredCount}`,
              completed: update.completed,
              xpEarned: update.xpEarned
            }))
          },
          details: progressUpdates
        };
  
      } catch (error) {
        if (transaction && !transaction.afterCommit) {
          await transaction.rollback();
        }
        throw error;
      }
    }
  }