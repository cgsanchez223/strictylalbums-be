const { List, Album, User } = require('../models');
const { Op } = require('sequelize');

// listController handles the ability for user's to make a list.

const listController = {
    // Create a new list
    createList: async (req, res) => {
        try {
            const { name, description, isPublic } = req.body;
            const userId = req.user.id;

            // console.log("=========================")
            // console.log(req.user.id)
            // console.log("=========================")

            const list = await List.create({
                name,
                description,
                isPublic,
                userId
            });

            res.status(201).json({
                success: true,
                message: 'List created successfully',
                data: list
            });
        } catch (error) {
            console.error('Create list error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating list',
                error: error.message
            });
        }
    },

    // Get user's lists
    getUserLists: async (req, res) => {
        try {
            const userId = req.user.id;

            const lists = await List.findAll({
                where: { userId },
                include: [{
                    model: Album,
                    as: 'albums',
                    through: { attributes: [] }
                }],
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                data: lists
            });
        } catch (error) {
            console.error('Get lists error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching lists',
                error: error.message
            });
        }
    },

    // Get specific list
    getList: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const list = await List.findOne({
                where: {
                    id,
                    [Op.or]: [
                        { userId },
                        { isPublic: true }
                    ]
                },
                include: [
                    {
                        model: Album,
                        as: 'albums',
                        through: { attributes: [] }
                    },
                    {
                        model: User,
                        as: 'Users',
                        attributes: ['id', 'username', 'avatar_url']
                    }
                ]
            });

            if (!list) {
                return res.status(404).json({
                    success: false,
                    message: 'List not found'
                });
            }

            res.json({
                success: true,
                data: list
            });
        } catch (error) {
            console.error('Get list error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching list',
                error: error.message
            });
        }
    },

    // Update list
    updateList: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, isPublic } = req.body;
            const userId = req.user.id;

            const list = await List.findOne({
                where: { id, userId }
            });

            if (!list) {
                return res.status(404).json({
                    success: false,
                    message: 'List not found'
                });
            }

            await list.update({
                name,
                description,
                isPublic
            });

            res.json({
                success: true,
                message: 'List updated successfully',
                data: list
            });
        } catch (error) {
            console.error('Update list error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating list',
                error: error.message
            });
        }
    },

    // Delete List
    deleteList: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const list = await List.findOne({
                where: { id, userId }
            });

            if (!list) {
                return res.status(404).json({
                    success: false,
                    message: 'List not found'
                });
            }

            await list.destroy();

            res.json({
                success: true,
                message: 'List deleted successfully'
            });
        } catch (error) {
            console.error('Delete list error:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting list',
                error: error.message
            });
        }
    },

    // Add album to list
    addAlbumToList: async (req, res) => {
        try {
            const { listId } = req.params;
            const { albumId, albumName, artistName, imageUrl } = req.body;
            const userId = req.user.id;

            const list = await List.findOne({
                where: { id: listId, userId }
            });

            if (!list) {
                return res.status(404).json({
                    success: false,
                    message: 'List not found'
                });
            }

            // Find or create album
            const [album] = await Album.findOrCreate({
                where: { id: albumId },
                defaults: {
                    name: albumName,
                    artistName,
                    imageUrl
                }
            });

            await list.addAlbum(album);

            res.json({
                success: true,
                message: 'Album added to list successfully'
            });
        } catch (error) {
            console.error('Add album to list error:', error);
            res.status(500).json({
                success: false,
                message: 'Error adding album to list',
                error: error.message
            });
        }
    },

    // Remove album from list
    removeAlbumFromList: async (req, res) => {
        try {
            const { listId, albumId } = req.params;
            const userId = req.user.id;

            const list = await List.findOne({
                where: { id: listId, userId }
            });

            if (!list) {
                return res.status(404).json({
                    success: false,
                    message: 'List not found'
                });
            }

            await list.removeAlbum(albumId);

            res.json({
                success: true,
                message: 'Album removed from list successfully'
            });
        } catch (error) {
            console.error('Remove album from list error:', error);
            res.status(500).json({
                success: false,
                message: 'Error removing album from list',
                error: error.message
            });
        }
    }
};

module.exports = listController;