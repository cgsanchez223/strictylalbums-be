
// Model for the user created lists.
// id = Each new list created makes a new id
// userId = to recall the user creating the list
// name = the specified name/title of the list
// description = description box to describe the list
// isPublic = ability to make list public for other user - PENDING FEATURE, NO WAY TO VIEW LIST FOR OTHER USERS AT THE MOMENT.


module.exports = (sequelize, DataTypes) => {
    const List = sequelize.define('List', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            refrences: {
                model: 'Users',
                key: 'id'
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 100]
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'lists',
        timestamps: true
    });

    List.associate = function(models) {
        List.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'Users'
        });

        List.belongsToMany(models.Album, {
            through: 'ListAlbums',
            foreignKey: 'listId',
            as: 'albums'
        });
    };

    return List;
};