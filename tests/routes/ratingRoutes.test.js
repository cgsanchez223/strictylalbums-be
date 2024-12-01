const request = require('supertest');
const express = require('express');
const ratingRoutes = require('../../routes/ratingRoutes'); // Adjust path as needed

// Mock dependencies
jest.mock('../../controllers/ratingController', () => ({
    createRating: jest.fn((req, res) => res.status(201).json({ message: 'Rating created successfully' })),
    getAlbumRating: jest.fn((req, res) => res.status(200).json({ albumId: req.params.albumId, rating: 4 })),
    getUserRatings: jest.fn((req, res) => res.status(200).json({ ratings: [], pagination: { page: 1, limit: 10 } })),
    getRecentRatings: jest.fn((req, res) => res.status(200).json({ ratings: [], pagination: { page: 1, limit: 10 } })),
    deleteRating: jest.fn((req, res) => res.status(200).json({ message: 'Rating deleted successfully'})),
}));

jest.mock('../../middleware/authMiddleware', () => (req, res, next) => {
    if (req.headers.authorization === 'Bearer valid-token') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

describe('Rating Routes', () => {
    const app = express();
    app.use(express.json());
    app.use('/rating', ratingRoutes);

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /ratings', () => {
        it('should create a new rating successfully', async () => {
            const response = await request(app)
                .post('/rating')
                .set('Authorization', 'Bearer valid-token')
                .send({ albumId: '1', rating: 4 });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Rating created successfully');
        });

        it('should return unauthorized error if no token is provided', async () => {
            const response = await request(app)
                .post('/rating')
                .send({ albumId: '1', rating: 4 });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });

    describe('GET /rating/album/:albumId', () => {
        it('should get the rating for a specific album', async () => {
            const response = await request(app)
                .get('/rating/album/1')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body.albumId).toBe('1');
            expect(response.body.rating).toBe(4);
        });

        it('should return unauthorized error if no token is provided', async () => {
            const response = await request(app).get('/rating/album/1');

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });

    describe('GET /rating/user', () => {
        it('should get the users rfatings with pagination', async () => {
            const response = await request(app)
                .get('/rating/user')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body.ratings).toEqual([]);
            expect(response.body.pagination).toEqual({ page: 1, limit: 10 });
        } );

        it('should return unauthorized error is no token is provided', async () => {
            const response = await request(app).get('/rating/user');

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });

    describe('GET /rating/recent', () => {
        it('should get the recent ratings with pagination', async () => {
            const response = await request(app)
                .get('/rating/recent')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body.ratings).toEqual([]);
            expect(response.body.pagination).toEqual({ page: 1, limit: 10 });
        });

        it('should return unauthorized error if no token is provided', async () => {
            const response = await request(app).get('/rating/recent');

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });

    describe('DELETE /rating/:id', () => {
        it('should delete a rating successfully', async () => {
            const response = await request(app)
                .delete('/rating/1')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Rating deleted successfully');
        });

        it('should return unauthorized error if no token is provided', async () => {
            const response = await request(app).delete('/rating/1');

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });
});