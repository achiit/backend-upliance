import { UserStreak } from '../models';
import fs from 'fs/promises';
import path from 'path';

interface ProcessedStreak {
  userId: string;
  action: 'maintained' | 'freeze_used' | 'reset';
  previousStreak: number;
  currentStreak: number;
  freezesRemaining: number;
}

export class StreakManager {
    private readonly logPath: string;
    private readonly MAX_FREEZES = 5; // Maximum streak freezes allowed
  
    constructor() {
      // Use absolute path from project root
      this.logPath = path.join(process.cwd(), 'logs', 'streaks');
      this.ensureLogDirectory();
    }
  
    private async ensureLogDirectory() {
      try {
        await fs.mkdir(this.logPath, { recursive: true });
      } catch (error) {
        console.error('Error creating log directory:', error);
      }
    }
  
    async processMidnightCheck(): Promise<ProcessedStreak[]> {
      const transaction = await UserStreak.sequelize!.transaction();
      const processedStreaks: ProcessedStreak[] = [];
  
      try {
        // Get all streaks
        const streaks = await UserStreak.findAll({ transaction });
        const now = new Date();

        console.log(`the date is ${now}`)
        for (const streak of streaks) {
          const lastReset = new Date(streak.get('lastDailyReset'));
          const dailyTaskCompleted = streak.get('dailyTaskCompleted');
          const currentStreak = streak.get('currentStreak');
          const streakFreezes = streak.get('streakFreezes');

          console.log(`the daily reset date is ${lastReset}`)
          // Determine if it's a new day
          const isNewDay = !this.isSameDay(lastReset, now);
  
          if (isNewDay) {
            const previousStreak = currentStreak;
  
            if (dailyTaskCompleted) {
              // Task was completed - maintain streak
              await streak.update(
                {
                  dailyTaskCompleted: false,
                  lastDailyReset: now,
                },
                { transaction }
              );
  
              processedStreaks.push({
                userId: streak.get('userId'),
                action: 'maintained',
                previousStreak,
                currentStreak,
                freezesRemaining: streakFreezes,
              });
            } else if (streakFreezes > 0) {
              // Use streak freeze
              await streak.update(
                {
                  streakFreezes: streakFreezes - 1,
                  dailyTaskCompleted: false,
                  lastDailyReset: now,
                },
                { transaction }
              );
  
              processedStreaks.push({
                userId: streak.get('userId'),
                action: 'freeze_used',
                previousStreak,
                currentStreak,
                freezesRemaining: streakFreezes - 1,
              });
            } else {
              // Reset streak
              await streak.update(
                {
                  currentStreak: 0,
                  streakFreezes: this.MAX_FREEZES,
                  dailyTaskCompleted: false,
                  lastDailyReset: now,
                },
                { transaction }
              );
  
              processedStreaks.push({
                userId: streak.get('userId'),
                action: 'reset',
                previousStreak,
                currentStreak: 0,
                freezesRemaining: this.MAX_FREEZES,
              });
            }
          }
        }
  
        await this.saveLog(processedStreaks);
        await transaction.commit();
  
        return processedStreaks;
      } catch (error) {
        await transaction.rollback();
        console.error('[StreakManager] Error during midnight check:', error);
        throw error;
      }
    }
  
    private async saveLog(processedStreaks: ProcessedStreak[]) {
      const today = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logPath, `streak-log-${today}.json`);
  
      const logData = {
        date: today,
        processedAt: new Date().toISOString(),
        streaks: processedStreaks,
      };
  
      await fs.writeFile(logFile, JSON.stringify(logData, null, 2));
    }
  
    async getTodayLogs() {
      const today = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logPath, `streak-log-${today}.json`);
  
      try {
        const logContent = await fs.readFile(logFile, 'utf-8');
        return JSON.parse(logContent);
      } catch (error) {
        return {
          date: today,
          processedAt: new Date().toISOString(),
          streaks: [],
        };
      }
    }
  
    private isSameDay(date1: Date, date2: Date): boolean {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    }
  }
  