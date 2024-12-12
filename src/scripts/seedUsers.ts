import { User, UserStreak } from '../models';
import sequelize from '../config/database';

const testUsers = [
  {
    id: 'user1-uuid',
    nickName: 'Aman',
    totalXp: 0
  },
  {
    id: 'user2-uuid',
    nickName: 'Sarah',
    totalXp: 0
  },
  {
    id: 'user3-uuid',
    nickName: 'John',
    totalXp: 0
  },
  {
    id: 'user4-uuid',
    nickName: 'Emma',
    totalXp: 0
  }
];

async function seedUsers() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Create Users
    for (const userData of testUsers) {
      const [user] = await User.findOrCreate({
        where: { id: userData.id },
        defaults: userData
      });
      console.log(`User created/found: ${user.get('nickName')}`);

      // Create or update UserStreak for each user
      await UserStreak.findOrCreate({
        where: { userId: user.get('id') },
        defaults: {
          userId: user.get('id'),
          currentStreak: 0,
          lastSessionDate: null,
          streakFreezes: 5,
          freezesLastReset: new Date(),
          longestStreak: 0,
          dailyTaskCompleted: false,
          lastDailyReset: new Date()
        }
      });
      console.log(`Streak entry created/found for: ${user.get('nickName')}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seeding
seedUsers();