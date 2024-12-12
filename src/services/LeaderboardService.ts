

import { User } from '../models';

export class LeaderboardService {
  /**
   * Get leaderboard data sorted by total XP.
   * @param limit - Number of users to fetch (default: 10).
   * @param offset - Starting point for fetching users (default: 0).
   */
  async getLeaderboard(limit: number = 10, offset: number = 0) {
    try {
      // Fetch users sorted by total XP in descending order
      const users = await User.findAll({
        order: [['totalXp', 'DESC']], // Order by total XP
        attributes: ['id', 'nickName', 'totalXp'], // Only fetch necessary fields
        limit,
        offset,
      });

      // Format leaderboard response
      const leaderboard = users.map(user => ({
        userId: user.get('id'),
        nickName: user.get('nickName'),
        totalXp: user.get('totalXp'),
      }));

      // Count total users
      const totalUsers = await User.count();

      return {
        leaderboard,
        totalUsers,
        limit,
        offset,
      };
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      throw error;
    }
  }
}
