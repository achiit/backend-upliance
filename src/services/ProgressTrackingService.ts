import { Transaction } from 'sequelize';
import { Badge, BadgeSubtask, UserProgress, User } from '../models';
import { StreakService } from './StreakService';
import { log } from 'console';

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

      // Add cooking session XP
      const COOKING_SESSION_XP = 10;
      // await this.userProgressService.addCookingSessionXP(session.user.id);
      totalXpEarned += COOKING_SESSION_XP;  // Add cooking session XP to total

      // Process streak first
      const streakResult = await this.streakService.processSession(
        session.user.id,
        new Date(),
        transaction
      );
      log(`the streak result is ${streakResult}`)
      totalXpEarned += streakResult.xpEarned;
      

      // Get active badges with their subtasks
      const badges = await Badge.findAll({
        where: { isActive: true },
        include: [BadgeSubtask]
      });

      // Process each badge's subtasks
      for (const badge of badges) {
        const badgeData = badge.get({ plain: true });
        log(`the bade data is ${user.nickName}`)
        // Process each subtask
        for (const subtask of badgeData.BadgeSubtasks || []) {
          // Check if this recipe matches the subtask requirements
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

      // Update user's total XP (including streak XP)
      // const totalSessionXP = totalXpEarned + streakResult.xpEarned;
      if (totalXpEarned > 0) {
        await user.increment('totalXp', {
          by: totalXpEarned,
          transaction
        });
      }

      await transaction.commit();

      // Format progress updates for response
      const formattedUpdates = progressUpdates.map(update => ({
        badge: update.badgeName,
        subtask: update.subtaskDescription,
        progress: `${update.newCount}/${update.requiredCount}`,
        completed: update.completed,
        xpEarned: update.xpEarned
      }));

      return {
        sessionSummary: {
          userId: session.user.id,
          totalXpEarned: totalXpEarned,
          updatedUserXp: (user.get('totalXp') as number) ,
          progressUpdates: formattedUpdates
        },
        streakProgress: {
          streakXpEarned: streakResult.xpEarned,
          isStreakMaintained: streakResult.isStreakMaintained,
          usedFreeze: streakResult.usedFreeze,
          currentStreak: streakResult.currentStreak,
          streakFreezes: streakResult.streakFreezes,
          longestStreak: streakResult.longestStreak,
          dailyTaskCompleted: true
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

  private doesSessionMatchSubtask(recipe: CookingSession['sessionRecipe'], subtask: any): boolean {
    const rules = subtask.requirementRules || [];
    
    if (rules.length === 0) {
      return true;
    }

    return rules.every(rule => {
      switch (rule.field) {
        case 'category':
          const recipeCategories = recipe.Recipe_Categories_Map?.map(cat => cat.recipe_category.id);
          return rule.values?.some(id => recipeCategories?.includes(id)) || false;

        case 'meal_type':
          return rule.stringValues?.some(type => recipe.meal_type?.includes(type)) || false;

        case 'diet':
          return rule.stringValues?.some(diet => recipe.diet?.includes(diet)) || false;

        case 'cuisine':
          return rule.stringValues?.some(cuisine => recipe.cuisine?.includes(cuisine)) || false;

        case 'created_source':
          return rule.stringValues?.includes(recipe.created_source) || false;

        default:
          return false;
      }
    });
  }

  async getUserProgress(userId: string) {
    const badges = await Badge.findAll({
      where: { isActive: true },
      include: [{
        model: BadgeSubtask,
        include: [{
          model: UserProgress,
          where: { userId },
          required: false
        }]
      }]
    });

    return badges.map(badge => {
      const badgeData = badge.get({ plain: true });
      const subtasks = badgeData.BadgeSubtasks.map((subtask: any) => {
        const progress = subtask.UserProgresses?.[0] || {
          currentCount: 0,
          completed: false
        };

        return {
          ...subtask,
          currentCount: progress.currentCount,
          completed: progress.completed,
          completedAt: progress.completedAt
        };
      });

      return {
        id: badge.get('id'),
        name: badge.get('name'),
        description: badge.get('description'),
        subtasks
      };
    });
  }
}
