// model for the populated album. Contains id, name of album, artist/band name, album cover image

module.exports = (sequelize, DataTypes) => {
    const Album = sequelize.define('Album', {
        id: {
            type: DataTypes.STRING, // Spotify album ID
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        artistName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'albums',
        timestamps: true
    });

    Album.associate = function(models) {
        Album.belongsToMany(models.List, {
            through: 'ListAlbums',
            foreignKey: 'albumId',
            as: 'lists'
        });
    };

    return Album;
};