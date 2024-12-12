



import { Router } from 'express';
import { User } from '../../models';

const leaderboardRouter = Router();

/**
 * GET /api/leaderboard
 * Fetch the leaderboard based on total XP.
 */
leaderboardRouter.get('/', async (req, res) => {
  const { limit = 10, offset = 0 } = req.query;

  try {
    // Parse query parameters
    const parsedLimit = Number(limit);
    const parsedOffset = Number(offset);

    // Fetch users sorted by total XP in descending order
    const users = await User.findAll({
      order: [['totalXp', 'DESC']], // Order by total XP
      attributes: ['id', 'nickName', 'totalXp'], // Only fetch necessary fields
      limit: parsedLimit,
      offset: parsedOffset,
    });

    // Format leaderboard response
    const leaderboard = users.map(user => ({
      userId: user.get('id'),
      nickName: user.get('nickName'),
      totalXp: user.get('totalXp'),
    }));

    // Count total users
    const totalUsers = await User.count();

    // Send response
    res.status(200).json({
      leaderboard,
      totalUsers,
      limit: parsedLimit,
      offset: parsedOffset,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default leaderboardRouter;
