import { RecipeCategory } from '../models/Category';
import sequelize from '../config/database';

const categories = [
  {
    id: 1,
    name: "Gravy",
    type: "category",
    isActive: true
  },
  {
    id: 2,
    name: "One Pot Meal",
    type: "category",
    isActive: true
  },
  {
    id: 3,
    name: "Staples",
    type: "category",
    isActive: true
  },
  {
    id: 4,
    name: "Breakfast",
    type: "category",
    isActive: true
  },
  {
    id: 5,
    name: "Snacks",
    type: "category",
    isActive: true
  },
  {
    id: 6,
    name: "Beverages",
    type: "category",
    isActive: true
  },
  {
    id: 7,
    name: "Desserts",
    type: "category",
    isActive: true
  },
  {
    id: 8,
    name: "Soup",
    type: "category",
    isActive: true
  },
  {
    id: 9,
    name: "Salad",
    type: "category",
    isActive: true
  },
  {
    id: 10,
    name: "Rice Dishes",
    type: "category",
    isActive: true
  }
];

async function seedCategories() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Sync the model with force:true to remove existing data
    await RecipeCategory.sync({ force: true });
    console.log('Category table created.');

    // Insert categories
    await RecipeCategory.bulkCreate(categories);
    console.log('Categories seeded successfully.');

    const count = await RecipeCategory.count();
    console.log(`Total categories in database: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

// Run the seed
seedCategories();