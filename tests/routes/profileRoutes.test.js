const request = require('supertest');
const express = require('express');
const profileRoutes = require('../../routes/profileRoutes');

// Mock dependencies
jest.mock('../../controllers/profileController', () => ({
    getProfile: jest.fn((req, res) => res.status(200).json({ user: { id: '1', name: 'Test User'}, ratings: [], lists: [] })),
    updateProfile: jest.fn((req, res) => res.status(200).json({ message: 'Profile updated successfully'})),
    getUserRatings: jest.fn((req, res) => res.status(200).json({ ratings: [], pagination: { page: 1, limit: 10 } })),
    getUserLists: jest.fn((req, res) => res.status(200).json({ lists: [], pagination: { page: 1, limit: 10 } })),
}));

jest.mock('../../middleware/authMiddleware', () => (req, res, next) => {
    if (req.headers.authorization === 'Bearer valid-token') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

describe('Profile Routes', () => {
    const app = express();
    app.use(express.json());
    app.use('/profile', profileRoutes);

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /profile', () => {
        it('should get the user profile with recent ratings and lists', async () => {
            const response = await request(app)
                .get('/profile')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body.user).toEqual({ id: '1', name: 'Test User' });
            expect(response.body.ratings).toEqual([]);
            expect(response.body.lists).toEqual([]);
        });

        it('should return unauthorized error if no token is provided', async () => {
            const response = await request(app).get('/profile');

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });

    describe('PUT /profile', () => {
        it('should update the user profile', async () => {
            const response = await request(app)
                .put('/profile')
                .set('Authorization', 'Bearer valid-token')
                .send({ name: 'Updated User' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Profile updated successfully');
        });

        it('should return unauthorized error if no token is provided', async () => {
            const response = await request(app).put('/profile').send({ name: 'Updated User' });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });

    describe('GET /profile/ratings', () => {
        it('should get the user ratings with pagination', async () => {
            const response = await request(app)
                .get('/profile/ratings')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body.ratings).toEqual([]);
            expect(response.body.pagination).toEqual({ page: 1, limit: 10 });
        });

        it('should return unauthorized error if no token is provided', async () => {
            const response = await request(app).get('/profile/ratings');

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });

    describe('GET /profile/lists', ()=> {
        it('should get the user lists with pagination', async () => {
            const response = await request(app)
                .get('/profile/lists')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body.lists).toEqual([]);
            expect(response.body.pagination).toEqual({ page: 1, limit: 10 });
        });

        it('should return unauthorized error if no token is provided', async () => {
            const response = await request(app).get('/profile/lists');

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });
});