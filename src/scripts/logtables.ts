import { Sequelize } from 'sequelize';

// Create a new Sequelize instance
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'database-2.cynyudqupy3f.us-east-2.rds.amazonaws.com',
  username: 'root',
  password: 'password',
  database:  'cooking_game',
  logging: false,
  port: 3306,
});

async function logTables() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Query to get all tables in the database
    const [tables] = await sequelize.query(
      `SELECT table_name AS TableName 
       FROM information_schema.tables 
       WHERE table_schema = :databaseName`,
      {
        replacements: { databaseName: process.env.DB_NAME || 'cooking_game' },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Log the tables
    console.log('Tables in the database:');
    (tables as { TableName: string }[]).forEach((table) => {
      console.log(`- ${table.TableName}`);
    });

    // Close the connection
    await sequelize.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
  }
}

logTables();
