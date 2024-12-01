const request = require('supertest');
const express = require('express');
const spotifyRoutes = require('../../routes/spotifyRoutes');

// Mock dependencies
jest.mock('../../controllers/spotifyController', () => ({
    searchAlbums: jest.fn((req, res) => res.status(200).json({ albums: [] })),
    getAlbumDetails: jest.fn((req, res) => res.status(200).json({ albumId: req.params.id, details: 'Album details here' })),
}));

jest.mock('../../middleware/authMiddleware', () => (req, res, next) => {
    if (req.headers.authorization === 'Bearer valid-token') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

describe('Spotify Routes', () => {
    const app = express();
    app.use(express.json());
    app.use('/spotify', spotifyRoutes);

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /spotify/search', () => {
        it('should search albums', async () => {
            const response = await request(app)
                .get('/spotify/search')
                .set('Authorization', 'Bearer valid-token')
                .query({ query: 'test album' });

            expect(response.status).toBe(200);
            expect(response.body.albums).toEqual([]);
        });

        it('should return unauthorized error if no token is provided', async () => {
            const response = await request(app).get('/spotify/search');

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });

    describe('GET /spotify/albums/:id', () => {
        it('should get the album details', async () => {
            const response = await request(app)
                .get('/spotify/albums/1')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body.albumId).toBe('1');
            expect(response.body.details).toBe('Album details here');
        });

        it('should return unauthorized error if no token is provided', async () => {
            const response = await request(app).get('/spotify/albums/1');

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });
});