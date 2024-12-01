const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/authRoutes');

// Mock dependencies
jest.mock('../../controllers/authController', () => ({
    register: jest.fn((req, res) => res.status(201).json({ message: 'User registered successfully' })),
    login: jest.fn((req, res) => res.status(200).json({ token: 'mockToken' })),
    verifySession: jest.fn((req, res) => res.status(200).json({ valid: true })),
}));

jest.mock('../../middleware/validateMiddleware', () => ({
    registerValidation: jest.fn((req, res, next) => next()),
    loginValidation: jest.fn((req, res, next) => next()),
    validate: jest.fn((req, res, next) => next()),
}));

jest.mock('../../middleware/authMiddleware', () => (req, res, next) => {
    if (req.headers.authorization === 'Bearer valid-token') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

describe('Auth Routes', () => {
    const app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app).post('/auth/register').send({
                username: 'testuser',
                password: 'password123',
            });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('User registered successfully');
        });
    });

    describe('POST /login', () => {
        it('should log in the user and return a token', async () => {
            const response = await request(app).post('/auth/login').send({
                username: 'testuser',
                password: 'password123',
            });

            expect(response.status).toBe(200);
            expect(response.body.token).toBe('mockToken');
        });
    });

    describe('GET /verify', () => {
        it('should verify session when authorization header is valid', async () => {
            const response = await request(app)
                .get('/auth/verify')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body.valid).toBe(true);
        });

        it('should return unauthorized error when no authorization header is provided', async () => {
            const response = await request(app).get('/auth/verify');

            expect(response.status).toBe(401);
            expect(resonse.body.error).toBe('Unauthorized');
        });
    });
});