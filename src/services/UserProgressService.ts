// import { Badge, BadgeSubtask, UserProgress, User, UserStreak } from '../models';

// export class UserProgressService {
//   async getUserProgress(userId: string) {
//     try {
//       const user = await User.findByPk(userId);
//       if (!user) {
//         throw new Error('User not found');
//       }

//       // Fetch the user's streak data
//       const streak = await UserStreak.findOne({ where: { userId } });
//       const streakProgress = streak
//         ? {
//             currentStreak: streak.get('currentStreak'),
//             streakFreezes: streak.get('streakFreezes'),
//             longestStreak: streak.get('longestStreak'),
//             dailyTaskCompleted: streak.get('dailyTaskCompleted'),
//           }
//         : {
//             currentStreak: 0,
//             streakFreezes: 5, // Default max freezes
//             longestStreak: 0,
//             dailyTaskCompleted: false,
//           };

//       // Get only active badges with their subtasks and progress
//       const badges = await Badge.findAll({
//         where: { isActive: true }, // Only get active badges
//         include: [
//           {
//             model: BadgeSubtask,
//             include: [
//               {
//                 model: UserProgress,
//                 where: { userId },
//                 required: false,
//               },
//             ],
//           },
//         ],
//       });

//       let totalPossibleXp = 0;
//       let totalEarnedXp = 0;
//       let totalSubtasks = 0;
//       let completedSubtasks = 0;

//       const badgesProgress = badges.map((badge) => {
//         const badgeData = badge.get({ plain: true });
//         const subtasks = badgeData.BadgeSubtasks.map((subtask: any) => {
//           const progress = subtask.UserProgresses?.[0] || {
//             currentCount: 0,
//             completed: false,
//             completedAt: null,
//           };

//           totalSubtasks++;
//           if (progress.completed) {
//             completedSubtasks++;
//             totalEarnedXp += subtask.xpPerCompletion * subtask.requiredCount;
//           }
//           totalPossibleXp += subtask.xpPerCompletion * subtask.requiredCount;

//           return {
//             id: subtask.id,
//             description: subtask.description,
//             requiredCount: subtask.requiredCount,
//             currentCount: progress.currentCount,
//             xpPerCompletion: subtask.xpPerCompletion,
//             isCompleted: progress.completed,
//             completedAt: progress.completedAt,
//             requirementRules: subtask.requirementRules,
//           };
//         });

//         const completedSubtasksCount = subtasks.filter((s) => s.isCompleted).length;

//         return {
//           badgeId: badge.get('id'),
//           badgeName: badge.get('name'),
//           description: badge.get('description'),
//           totalXp: badge.get('totalXp'),
//           isCompleted: completedSubtasksCount === subtasks.length && subtasks.length > 0,
//           subtasks,
//           completedSubtasks: completedSubtasksCount,
//           totalSubtasks: subtasks.length,
//           completionPercentage:
//             subtasks.length > 0 ? (completedSubtasksCount / subtasks.length) * 100 : 0,
//         };
//       });

//       const completedBadges = badgesProgress.filter((b) => b.isCompleted).length;

//       return {
//         user: {
//           id: user.get('id'),
//           nickName: user.get('nickName'),
//           totalXp: user.get('totalXp'),
//         },
//         badgesProgress: {
//           total: badges.length, // This will now only count active badges
//           completed: completedBadges,
//           inProgress: badges.length - completedBadges,
//           badges: badgesProgress,
//         },
//         subtasksProgress: {
//           total: totalSubtasks,
//           completed: completedSubtasks,
//           completionPercentage: totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0,
//         },
//         totalPossibleXp,
//         totalEarnedXp,
//         xpProgress: totalPossibleXp > 0 ? (totalEarnedXp / totalPossibleXp) * 100 : 0,
//         streakProgress, // Added streak progress
//       };
//     } catch (error) {
//       console.error('Error in getUserProgress:', error);
//       throw error;
//     }
//   }
// }
import { Badge, BadgeSubtask, UserProgress, User, UserStreak } from '../models';

export class UserProgressService {
  private calculateSubtaskProgress(subtask: any, progress: any) {
    return {
      id: subtask.id,
      description: subtask.description,
      requiredCount: subtask.requiredCount,
      currentCount: progress.currentCount,
      xpPerCompletion: subtask.xpPerCompletion,
      isCompleted: progress.completed,
      completedAt: progress.completedAt,
      requirementRules: subtask.requirementRules,
    };
  }

  private calculateBadgeProgress(badge: any, subtasks: any[]) {
    const completedSubtasksCount = subtasks.filter((s) => s.isCompleted).length;
    
    return {
      badgeId: badge.get('id'),
      badgeName: badge.get('name'),
      description: badge.get('description'),
      imageUrl: badge.get('imageUrl'),
      isSeasoned: badge.get('isSeasoned'),
      activeFrom: badge.get('activeFrom'),
      activeTill: badge.get('activeTill'),
      totalXp: badge.get('totalXp'),
      isCompleted: completedSubtasksCount === subtasks.length && subtasks.length > 0,
      subtasks,
      completedSubtasks: completedSubtasksCount,
      totalSubtasks: subtasks.length,
      completionPercentage: subtasks.length > 0 ? (completedSubtasksCount / subtasks.length) * 100 : 0,
    };
  }

  async getUserProgress(userId: string) {
    try {
      // Fetch data in parallel
      const [user, streak, badges] = await Promise.all([
        User.findByPk(userId, {
          attributes: ['id', 'nickName', 'totalXp']
        }),
        UserStreak.findOne({ 
          where: { userId },
          attributes: ['currentStreak', 'streakFreezes', 'longestStreak', 'dailyTaskCompleted']
        }),
        Badge.findAll({
          where: { isActive: true },
          attributes: ['id', 'name', 'description', 'totalXp', 'imageUrl', 'isSeasoned', 'activeFrom', 'activeTill'],
          include: [{
            model: BadgeSubtask,
            attributes: ['id', 'description', 'requiredCount', 'xpPerCompletion', 'requirementRules'],
            include: [{
              model: UserProgress,
              where: { userId },
              required: false,
              attributes: ['currentCount', 'completed', 'completedAt']
            }]
          }]
        })
      ]);

      if (!user) {
        throw new Error('User not found');
      }

      const streakProgress = streak
        ? streak.get({ plain: true })
        : {
            currentStreak: 0,
            streakFreezes: 5,
            longestStreak: 0,
            dailyTaskCompleted: false,
          };

      let totalPossibleXp = 0;
      let totalEarnedXp = 0;
      let totalSubtasks = 0;
      let completedSubtasks = 0;

      const badgesProgress = badges.map((badge) => {
        const badgeData = badge.get({ plain: true });
        const subtasks = badgeData.BadgeSubtasks.map((subtask: any) => {
          const progress = subtask.UserProgresses?.[0] || {
            currentCount: 0,
            completed: false,
            completedAt: null,
          };

          totalSubtasks++;
          if (progress.completed) {
            completedSubtasks++;
            totalEarnedXp += subtask.xpPerCompletion * subtask.requiredCount;
          }
          totalPossibleXp += subtask.xpPerCompletion * subtask.requiredCount;

          return this.calculateSubtaskProgress(subtask, progress);
        });

        return this.calculateBadgeProgress(badge, subtasks);
      });

      const completedBadges = badgesProgress.filter((b) => b.isCompleted).length;
      const totalBadges = badges.length;

      return {
        user: user.get({ plain: true }),
        badgesProgress: {
          total: totalBadges,
          completed: completedBadges,
          inProgress: totalBadges - completedBadges,
          badges: badgesProgress,
        },
        subtasksProgress: {
          total: totalSubtasks,
          completed: completedSubtasks,
          completionPercentage: totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0,
        },
        totalPossibleXp,
        totalEarnedXp,
        xpProgress: totalPossibleXp > 0 ? (totalEarnedXp / totalPossibleXp) * 100 : 0,
        streakProgress,
      };
    } catch (error) {
      console.error('Error in getUserProgress:', {
        userId,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}