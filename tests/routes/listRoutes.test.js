const request = require('supertest');
const express = require('express');
const listRoutes = require('../../routes/listRoutes');

// Mock dependencies
jest.mock('../../controllers/listController', () => ({
    createList: jest.fn((req, res) => res.status(201).json({ message: 'List created successfully' })),
    getUserLists: jest.fn((req, res) => res.status(200).json({ lists: [] })),
    getList: jest.fn((req, res) => res.status(200).json({ list: { id: req.params.id }})),
    updateList: jest.fn((req, res) => res.status(200).json({ message: 'List updated successfully' })),
    deleteList: jest.fn((req, res) => res.status(200).json({ message: 'List deleted successfully' })),
    addAlbumToList: jest.fn((req, res) => res.status(201).json({ message: 'Album added to list' })),
    removeAlbumFromList: jest.fn((req, res) => res.status(200).json({ message: 'Album removed from list' })),
}));

jest.mock('../../middleware/authMiddleware', () => (req, res, next) => {
    if (req.headers.authorization === 'Bearer valid-token') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

describe('List Routes', () => {
    const app = express();
    app.use(express.json());
    app.use('/lists', listRoutes);

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /lists', () => {
        it('should create a new list', async () => {
            const response = await request(app)
                .post('/lists')
                .set('Authorization', 'Bearer valid-token')
                .send({ name: 'My Favorite Albums' });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('List created successfully');
        });

        it('should return unauthorized error if no token is provided', async () => {
            const response = await request(app).post('/lists').send({ name: 'My Favorite Albums' });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });

    describe('GET /lists', () => {
        it('shoudl get all lists for a user', async () => {
            const response = await request(app)
                .get('/lists')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body.lists).toEqual([]);
        });

        it('should return unauthorized error if no token is provided', async () => {
            const response = await request(app).get('/lists');

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });

    describe('GET /lists/:id', () => {
        it('should get a specific list by id', async () => {
            const response = await request(app)
                .get('/lists/1')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body.list.id).toBe('1');
        });

        it('should return unauthorized error id no token is provided', async () => {
            const response = await request(app).get('/lists/1');

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });

    describe('PUT /lists/:id', () => {
        it('should update a specific list', async () => {
            const response = await request(app)
                .put('/lists/1')
                .set('Authorization', 'Bearer valid-token')
                .send({ name: 'Updated List' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('List updated successfully');
        });

        it('should return unauthorized error if no token is provided', async () => {
            const response = await request(app).put('/lists/1').send({ name: 'Updated List' });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });

    describe('DELETE /lists/:id', () => {
        it('should delete a specific list', async () => {
            const response = await request(app)
                .delete('/lists/1')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('List deleted successfully');
        });

        it('should return unauthorized error if no token is provided', async () => {
            const response = await request(app).delete('/lists/1');

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });

    describe('POST /lists/:listId/albums', () => {
        it('should add an album to the list', async () => {
            const response = await request(app)
                .post('/lists/1/albums')
                .set('Authorization', 'Bearer valid-token')
                .send({ albumId: '123' });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Album added to list');
        });

        it('should return unauthorized error if no token is provided', async () => {
            const response = await request(app).post('/lists/1/albums').send({ albumId: '123' });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });

    describe('DELETE /lists/:listId/albums/:albumId', () => {
        it('should remove an album from the list', async () => {
            const response = await request(app)
                .delete('/lists/1/albums/123')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Album removed from list');
        });

        it('should return unauthorized error if no token is provided', async () => {
            const response = await request(app).delete('/lists/albums/123');

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Unauthorized');
        });
    });
});