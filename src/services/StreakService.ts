// import { UserStreak, User } from '../models';
// import { Transaction } from 'sequelize';

// interface StreakResponse {
//   currentStreak: number;
//   streakFreezes: number;
//   xpEarned: number;
//   isStreakMaintained: boolean;
//   usedFreeze: boolean;
//   isNewStreak: boolean;
//   longestStreak: number;
// }

// export class StreakService {
//   // Constants for testing - WILL BE CHANGED TO DAYS IN PRODUCTION
//   private STREAK_INTERVAL = 1; // 1 minute for testing
//   private STREAK_XP = 5;
//   private MILESTONE_INTERVAL = 10;
//   private MILESTONE_XP = 50;
//   private MAX_FREEZES = 5;

//   async processSession(userId: string, sessionDate: Date, transaction?: Transaction): Promise<StreakResponse> {
//     let streak = await UserStreak.findOne({
//       where: { userId }
//     });

//     if (!streak) {
//       streak = await UserStreak.create({
//         userId,
//         currentStreak: 0,
//         lastSessionDate: null,
//         streakFreezes: this.MAX_FREEZES,
//         freezesLastReset: new Date(),
//         longestStreak: 0
//       });
//     }

//     // If this is the first session ever
//     if (!streak.lastSessionDate) {
//       await streak.update({
//         currentStreak: 1,
//         lastSessionDate: sessionDate
//       }, { transaction });

//       return {
//         currentStreak: 1,
//         streakFreezes: streak.streakFreezes,
//         xpEarned: this.STREAK_XP,
//         isStreakMaintained: true,
//         usedFreeze: false,
//         isNewStreak: true,
//         longestStreak: 1
//       };
//     }

//     // Calculate time difference in minutes for testing (will be days in production)
//     const timeDiff = Math.floor(
//       (sessionDate.getTime() - streak.lastSessionDate.getTime()) / (1000 * 60)
//     );
    
//     // For logging/debugging
//     console.log('Time difference in minutes:', timeDiff);

//     // Check if it's a new "day" (minute for testing)
//     if (timeDiff < this.STREAK_INTERVAL) {
//       // Same "day" - no streak update needed
//       return {
//         currentStreak: streak.currentStreak,
//         streakFreezes: streak.streakFreezes,
//         xpEarned: 0,
//         isStreakMaintained: true,
//         usedFreeze: false,
//         isNewStreak: false,
//         longestStreak: streak.longestStreak
//       };
//     }

//     // Check if streak is broken
//     if (timeDiff > this.STREAK_INTERVAL) {
//       // Check if we can use a freeze
//       if (streak.streakFreezes > 0) {
//         // Use a freeze
//         await streak.update({
//           streakFreezes: streak.streakFreezes - 1,
//           lastSessionDate: sessionDate
//         }, { transaction });

//         return {
//           currentStreak: streak.currentStreak,
//           streakFreezes: streak.streakFreezes - 1,
//           xpEarned: this.STREAK_XP,
//           isStreakMaintained: true,
//           usedFreeze: true,
//           isNewStreak: false,
//           longestStreak: streak.longestStreak
//         };
//       }

//       // Streak is broken - reset everything
//       await streak.update({
//         currentStreak: 1,
//         streakFreezes: this.MAX_FREEZES,
//         lastSessionDate: sessionDate,
//         freezesLastReset: new Date()
//       }, { transaction });

//       return {
//         currentStreak: 1,
//         streakFreezes: this.MAX_FREEZES,
//         xpEarned: this.STREAK_XP,
//         isStreakMaintained: false,
//         usedFreeze: false,
//         isNewStreak: true,
//         longestStreak: streak.longestStreak
//       };
//     }

//     // Perfect streak continuation
//     const newStreak = streak.currentStreak + 1;
//     let xpEarned = this.STREAK_XP;

//     // Check for milestone
//     if (newStreak % this.MILESTONE_INTERVAL === 0) {
//       xpEarned += this.MILESTONE_XP;
//     }

//     // Update streak
//     await streak.update({
//       currentStreak: newStreak,
//       lastSessionDate: sessionDate,
//       longestStreak: Math.max(newStreak, streak.longestStreak)
//     }, { transaction });

//     // Update user's XP
//     const user = await User.findByPk(userId);
//     if (user) {
//       await user.increment('totalXp', {
//         by: xpEarned,
//         transaction
//       });
//     }

//     return {
//       currentStreak: newStreak,
//       streakFreezes: streak.streakFreezes,
//       xpEarned,
//       isStreakMaintained: true,
//       usedFreeze: false,
//       isNewStreak: true,
//       longestStreak: Math.max(newStreak, streak.longestStreak)
//     };
//   }

//   async getStreakInfo(userId: string) {
//     const streak = await UserStreak.findOne({
//       where: { userId },
//       raw: true  // Get raw data
//     });

//     if (!streak) {
//       return {
//         currentStreak: 0,
//         streakFreezes: this.MAX_FREEZES,
//         lastSessionDate: null,
//         longestStreak: 0,
//         freezesLastReset: new Date()
//       };
//     }

//     // Format the dates for consistent output
//     return {
//       currentStreak: streak.currentStreak,
//       streakFreezes: streak.streakFreezes,
//       lastSessionDate: streak.lastSessionDate ? new Date(streak.lastSessionDate).toISOString() : null,
//       longestStreak: streak.longestStreak,
//       freezesLastReset: new Date(streak.freezesLastReset).toISOString(),
//       nextStreakAvailable: this.calculateNextStreakTime(new Date(streak.lastSessionDate))
//     };
//   }

//   private calculateNextStreakTime(lastSessionDate: Date): string {
//     if (!lastSessionDate) return new Date().toISOString();
    
//     // Add STREAK_INTERVAL minutes to last session date
//     const nextAvailable = new Date(lastSessionDate.getTime() + (this.STREAK_INTERVAL * 60 * 1000));
//     return nextAvailable.toISOString();
//   }
// }
import { log } from 'console';
import { UserStreak } from '../models';
import { Transaction } from 'sequelize';

interface StreakResponse {
  currentStreak: number;
  streakFreezes: number;
  xpEarned: number;
  isStreakMaintained: boolean;
  usedFreeze: boolean;
  isNewStreak: boolean;
  longestStreak: number;
}

export class StreakService {
  private STREAK_XP = 5; // XP for maintaining a streak
  private MILESTONE_INTERVAL = 10; // Milestone interval
  private MILESTONE_XP = 50; // Milestone XP reward
  private MAX_FREEZES = 5; // Max streak freezes

  /**
   * Process a session for a user and update their streak accordingly.
   * @param userId - The user's ID.
   * @param sessionDate - The date of the session.
   * @param transaction - Optional Sequelize transaction.
   * @returns StreakResponse - The updated streak details.
   */
  async processSession(userId: string, sessionDate: Date, transaction?: Transaction): Promise<StreakResponse> {
    try {
      // Fetch or initialize the user's streak record
      let streak = await UserStreak.findOne({ where: { userId }, transaction });
      if (!streak) {
        log(`[StreakService] No streak record found for userId: ${userId}. Creating new record.`);
        streak = await UserStreak.create(
          {
            userId,
            currentStreak: 0,
            lastSessionDate: null,
            streakFreezes: this.MAX_FREEZES,
            freezesLastReset: new Date(),
            longestStreak: 0,
            dailyTaskCompleted: false,
            lastDailyReset: new Date(),
          },
          { transaction }
        );
      }

      // Use .get method to access attributes
      const currentStreak = streak.get('currentStreak');
      const lastSessionDate = streak.get('lastSessionDate');
      const longestStreak = streak.get('longestStreak');
      const streakFreezes = streak.get('streakFreezes');       

      log(`[StreakService] Initial streak data: ${JSON.stringify({
        currentStreak,
        lastSessionDate,
        longestStreak,
        streakFreezes,
      })}`);

      // Initialize variables
      const now = new Date();
      let xpEarned = this.STREAK_XP;
      let isStreakIncremented = false;

      // Determine if the session is a new day
      if (!lastSessionDate || !this.isSameDay(now, lastSessionDate)) {
        log(`[StreakService] New day detected. Updating streak for userId: ${userId}.`);

        const newStreak = currentStreak + 1;
        const newLongestStreak = Math.max(newStreak, longestStreak);

        // Check for milestone XP
        if (newStreak % this.MILESTONE_INTERVAL === 0) {
          log(`[StreakService] Milestone reached! Adding milestone XP: ${this.MILESTONE_XP}`);
          xpEarned += this.MILESTONE_XP;
        }

        // Update streak details
        await streak.update(
          {
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            lastSessionDate: now,
            dailyTaskCompleted: true,
            lastDailyReset: now,
          },
          { transaction }
        );

        log(`[StreakService] Streak updated successfully for userId: ${userId}.`);
        isStreakIncremented = true;
      } else {
        log(`[StreakService] Session is on the same day as the last session. No streak update.`);
      }

      // Refetch updated streak data
      const updatedStreak = await UserStreak.findByPk(streak.get('id'), { transaction });
      const updatedCurrentStreak = updatedStreak?.get('currentStreak');
      const updatedLongestStreak = updatedStreak?.get('longestStreak');
      const updatedStreakFreezes = updatedStreak?.get('streakFreezes');

      log(`[StreakService] Updated streak data: ${JSON.stringify({
        currentStreak: updatedCurrentStreak,
        longestStreak: updatedLongestStreak,
        streakFreezes: updatedStreakFreezes,
      })}`);

      // Return the updated streak details
      return {
        currentStreak: updatedCurrentStreak ?? 0,
        streakFreezes: updatedStreakFreezes ?? this.MAX_FREEZES,
        xpEarned: isStreakIncremented ? xpEarned : 0,
        isStreakMaintained: true,
        usedFreeze: false,
        isNewStreak: isStreakIncremented,
        longestStreak: updatedLongestStreak ?? 0,
      };
    } catch (error) {
      log(`[StreakService] Error processing session for userId: ${userId}. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Determine if two dates are on the same day.
   * @param date1 - The first date.
   * @param date2 - The second date.
   * @returns boolean - True if the dates are the same day, false otherwise.
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
}