// Schema for the Rating system
// Ratings are done in a 1-5 value scale
// review - optional user description/review for the album

module.exports = (sequelize, DataTypes) => {
    const Rating = sequelize.define('Rating', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        albumId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        albumName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        artistName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        albumImage: {
            type: DataTypes.STRING,
            allowNull: true
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        review: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'ratings',
        timestamps: true, // Adds createdAt and updatedAt
        indexes: [
            {
                unique: true,
                fields: ['userId', 'albumId']
            }
        ]
    });

    Rating.associate = (models) => {
        Rating.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    };

    return Rating;
};