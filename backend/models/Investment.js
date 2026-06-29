const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Investment = sequelize.define('Investment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    symbol: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0.00001
        }
    },
    buyPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'Stock'
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

// Setup relationships
User.hasMany(Investment, { foreignKey: 'userId', onDelete: 'CASCADE' });
Investment.belongsTo(User, { foreignKey: 'userId' });

module.exports = Investment;
