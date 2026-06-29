const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.DATABASE_URL) {
    console.log('📡 Connecting to PostgreSQL Database over WebSockets...');
    
    let pgModule;
    try {
        pgModule = require('@neondatabase/serverless');
    } catch (e) {
        console.warn('⚠️ @neondatabase/serverless not found, using standard pg module.');
    }

    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectModule: pgModule,
        logging: false,
        dialectOptions: {
            ssl: process.env.DB_SSL === 'true' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        }
    });
} else {
    console.log('⚠️ DATABASE_URL not found in .env. Falling back to local SQLite database for development.');
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../database.sqlite'),
        logging: false
    });
}

// Test database connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
        if (process.env.DATABASE_URL) {
            console.log('🔄 Falling back to SQLite due to PostgreSQL connection failure...');
            sequelize = new Sequelize({
                dialect: 'sqlite',
                storage: path.join(__dirname, '../database.sqlite'),
                logging: false
            });
            try {
                await sequelize.authenticate();
                console.log('✅ SQLite fallback database connection established successfully.');
            } catch (fallbackError) {
                console.error('❌ Unable to connect to fallback SQLite database:', fallbackError.message);
            }
        }
    }
};

testConnection();

module.exports = sequelize;
