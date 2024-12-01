const { sequelize } = require('../models');

const initDatabase = async (force = false) => {
    try {
        // force: true will drop existing tables
        // alter: true will alter existing tables to match the model
        await sequelize.sync({ force, alter: !force });
        console.log('Database synced successfully');

        // You can add initial/seed data here if needed
        if (force) {
            // Add seed data when tables are recreated
            console.log('Adding seed data...');
            // await seedDatabase();
        }
    } catch (error) {
        console.error('Database sync error:', error);
        throw error;
    }
};

module.exports = initDatabase;