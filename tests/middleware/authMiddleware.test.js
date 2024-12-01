const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/authMiddleware');
const { User } = require('../../models');

// Mock the User model
jest.mock('../../models', () => ({
    User: {
        findByPk: jest.fn()
    }
}));

describe('Auth Middleware', () => {
    let mockReq;
    let mockRes;
    let nextFunction;
    let mockUser;

    beforeEach(() => {
        // Reset mocks before each test
        process.env.JWT_SECRET = 'test-secret-key';
        mockUser = {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            avatar_url: 'http://example.com/avatar.jpg',
            description: 'Test description',
            location: 'Test location',
            favorite_genres: ['rock', 'jazz'],
            social_links: { twitter: '@testuser' }
        };

        mockReq = {
            headers: {},
            user: null
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        nextFunction = jest.fn();

        // Reset the User.findByPk mock
        User.findByPk.mockReset();
    });

    it('should authenticate valid token and set user in request', async () => {
        // Create a valid token
        const token = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET);
        mockReq.headers.authorization = `Bearer ${token}`;

        // Mock the user find operation
        User.findByPk.mockResolvedValue(mockUser);

        await authMiddleware(mockReq, mockRes, nextFunction);

        expect(User.findByPk).toHaveBeenCalledWith(mockUser.id, {
            attributes: { exclude: ['password'] }
        });
        expect(mockReq.user).toEqual(mockUser);
        expect(nextFunction).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 401 when no token is provided', async () => {
        await authMiddleware(mockReq, mockRes, nextFunction);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'No token provided'
        });
        expect(nextFunction).not.toHaveBeenCalled();
        expect(User.findByPk).not.toHaveBeenCalled();
    });
});