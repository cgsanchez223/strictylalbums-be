const spotifyService = require('../services/spotifyServices');

// Handles the requirements for interacting with Spotify.
// Ability to search for albums and get back details.

const spotifyController = {
    // Search albums
    searchAlbums: async (req, res) => {
        try {
            const { query, limit, offset } = req.query;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            const results = await spotifyService.searchAlbums(query, limit, offset);

            res.json({
                success: true,
                data: results
            });
        } catch (error) {
            console.error('Search albums error:', error);
            res.status(500).json({
                success: false,
                message: 'Error searching albums',
                error: error.message
            });
        }
    },

    // Get album details
    getAlbumDetails: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Album ID is required'
                });
            }

            const album = await spotifyService.getAlbumDetails(id);

            res.json({
                success: true,
                data: album
            });
        } catch (error) {
            console.error('Get album details error:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting album details',
                error: error.message
            });
        }
    }
};

module.exports = spotifyController;