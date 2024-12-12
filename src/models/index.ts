// import { User } from './User';
// import { Badge } from './Badge';
// import { BadgeSubtask } from './BadgeSubtask';
// import { UserProgress } from './UserProgress';
// import { RecipeCategory } from './Category';
// import { SubtaskCategory } from './SubtaskCategory';

// // Define relationships
// Badge.hasMany(BadgeSubtask, { foreignKey: 'badgeId' });
// BadgeSubtask.belongsTo(Badge, { foreignKey: 'badgeId' });

// BadgeSubtask.hasMany(UserProgress, { foreignKey: 'subtaskId' });
// UserProgress.belongsTo(BadgeSubtask, { foreignKey: 'subtaskId' });

// User.hasMany(UserProgress, { foreignKey: 'userId' });
// UserProgress.belongsTo(User, { foreignKey: 'userId' });

// export {
//   User,
//   Badge,
//   BadgeSubtask,
//   UserProgress,
//   RecipeCategory,
//   SubtaskCategory
// };

import { Badge } from './Badge';
import { BadgeSubtask } from './BadgeSubtask';
import { UserProgress } from './UserProgress';
import { User } from './User';
import { RecipeCategory } from './Category';
import { UserStreak } from './UserStreak';


// Define relationships
Badge.hasMany(BadgeSubtask, { foreignKey: 'badgeId' });
BadgeSubtask.belongsTo(Badge, { foreignKey: 'badgeId' });

BadgeSubtask.hasMany(UserProgress, { foreignKey: 'subtaskId' });
UserProgress.belongsTo(BadgeSubtask, { foreignKey: 'subtaskId' });

User.hasMany(UserProgress, { foreignKey: 'userId' });
UserProgress.belongsTo(User, { foreignKey: 'userId' });
// In User model
User.hasOne(UserStreak, { foreignKey: 'userId', as: 'streak' });

// In UserStreak model
UserStreak.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  User,
  Badge,
  BadgeSubtask,
  UserProgress,
  RecipeCategory,
  UserStreak
};