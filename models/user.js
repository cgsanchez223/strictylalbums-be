// Schema for user data
// Note - Work In Progress for description, location, favorite_genres and social_links.
// At the moment, none are implemented in the project.

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        tableName: 'Users',
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        avatar_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true
        },
        favorite_genres: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: []
        },
        social_links: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {}
        }
    });

    User.associate = (models) => {
        User.hasMany(models.Rating, {
            foreignKey: 'userId',
            as: 'ratings'
        });
        User.hasMany(models.List, {
            foreignKey: 'user_id',
            as: 'lists'
        });
    };

    return User;
};