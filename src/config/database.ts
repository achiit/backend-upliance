// import { Sequelize } from 'sequelize';
// import dotenv from 'dotenv';

// dotenv.config();

// const sequelize = new Sequelize({
//   dialect: 'mysql',
//   host: process.env.DB_HOST || 'localhost',
//   username: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'cooking_game',
//   logging: false,
//   port:3306
//   // dialect: 'mysql',
//   // host: "database-1.cynyudqupy3f.us-east-2.rds.amazonaws.com",
//   // username: 'root',
//   // password: 'password',
//   // database: "cooking_game",
//   // logging: false,
//   // port:3306,
//   // pool: {
//   //   max: 155,
//   //   min: 55,
//   //   idle: 200000000,
//   //   evict: 150000000,
//   //   acquire: 300000000
//   // },
// });

// export default sequelize;
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true, // Enable SSL for production databases
      rejectUnauthorized: false, // Adjust based on your SSL setup
    },
  },
});

export default sequelize;
