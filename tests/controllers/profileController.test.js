const profileController = require('../../controllers/profileController');
const { User, Rating, List } = require('../../models');
const { Op } = require('sequelize');

// Mock the models
jest.mock('../../models', () => ({
    User: {
        findByPk: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn()
    },
    Rating: {
        findAndCountAll: jest.fn()
    },
    List: {
        findAndCountAll: jest.fn()
    }
}));

describe('Profile Controller', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        jest.clearAllMocks();

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        console.error = jest.fn();
    });

    describe('getProfile', () => {
        beforeEach(() => {
            mockReq = {
                user: { id: 1 }
            };
        });

        it('should successfully retrieve user profile with ratings and lists', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                ratings: [],
                lists: []
            };

            User.findByPk.mockResolvedValue(mockUser);

            await profileController.getProfile(mockReq, mockRes);

            expect(User.findByPk).toHaveBeenCalledWith(1, {
                attributes: { exclude: ['password'] },
                include: [
                    {
                        model: Rating,
                        as: 'ratings',
                        limit: null,
                        order: [['createdAt', 'DESC']]
                    },
                    {
                        model: List,
                        as: 'lists',
                        limit: 6,
                        order: [['createdAt', 'DESC']]
                    }
                ]
            });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockUser
            });
        });

        it('should return 404 if user not found', async () => {
            User.findByPk.mockResolvedValue(null);

            await profileController.getProfile(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });
    });

    describe('updateProfile', () => {
        beforeEach(() => {
            mockReq = {
                user: { id: 1 },
                body: {
                    username: 'newusername',
                    description: 'New description',
                    location: 'New location',
                    favorite_genres: ['rock', 'jazz'],
                    social_links: { twitter: '@newhandle' },
                    avatar_url: 'http://example.com/new-avatar.jpg'
                }
            };
        });

        it('should successfully update user profile', async () => {
            const mockUpdatedUser = {
                id: 1,
                ...mockReq.body
            };

            User.findOne.mockResolvedValue(null);
            User.update.mockResolvedValue([1]);
            User.findByPk.mockResolvedValue(mockUpdatedUser);

            await profileController.updateProfile(mockReq, mockRes);

            expect(User.update).toHaveBeenCalledWith(mockReq.body, {
                where: { id: mockReq.user.id },
                returning: true
            });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Profile updated successfully',
                data: mockUpdatedUser
            });
        });

        it('should return 400 if username is already taken', async () => {
            User.findOne.mockResolvedValue({ id: 2 });

            await profileController.updateProfile(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Username is already taken'
            });
        });
    });

    describe('getUserRatings', () => {
        beforeEach(() => {
            mockReq = {
                user: { id: 1 },
                query: { page: '1', limit: '10' }
            };
        });

        it('should successfully retrieve user ratings with pagination', async () => {
            const mockRatings = {
                rows: [
                    { id: 1, rating: 5 },
                    { id: 2, rating: 4 }
                ],
                count: 2
            };

            Rating.findAndCountAll.mockResolvedValue(mockRatings);

            await profileController.getUserRatings(mockReq, mockRes);

            expect(Rating.findAndCountAll).toHaveBeenCalledWith({
                where: { userId: 1 },
                order: [['createdAt', 'DESC']],
                limit: 10,
                offset: 0
            });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    ratings: mockRatings.rows,
                    pagination: {
                        total: mockRatings.count,
                        page: 1,
                        limit: 10,
                        totalPages: 1
                    }
                }
            });
        });

        it('should handle default pagination values', async () => {
            mockReq.query = {};
            const mockRatings = { rows: [], count: 0 };

            Rating.findAndCountAll.mockResolvedValue(mockRatings);

            await profileController.getUserRatings(mockReq, mockRes);

            expect(Rating.findAndCountAll).toHaveBeenCalledWith({
                where: { userId: 1 },
                order: [['createdAt', 'DESC']],
                limit: 10,
                offset: 0
            });
        });
    });

    describe('getUserLists', () => {
        beforeEach(() => {
            mockReq = {
                user: { id: 1 },
                query: { page: '1', limit: '10' }
            };
        });

        it('should successfully retrieve user lists with pagination', async () => {
            const mockLists = {
                rows: [
                    { id: 1, name: 'List 1' },
                    { id: 2, name: 'List 2' }
                ],
                count: 2
            };

            List.findAndCountAll.mockResolvedValue(mockLists);

            await profileController.getUserLists(mockReq, mockRes);

            expect(List.findAndCountAll).toHaveBeenCalledWith({
                where: { userId: 1 },
                order: [['createdAt', 'DESC']],
                limit: 10,
                offset: 0
            });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    lists: mockLists.rows,
                    pagination: {
                        total: mockLists.count,
                        page: 1,
                        limit: 10,
                        totalPages: 1
                    }
                }
            });
        });

        it('should handle error cases', async () => {
            List.findAndCountAll.mockRejectedValue(new Error('Database error'));

            await profileController.getUserLists(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Error fetching lists',
                error: expect.any(String)
            });
        });
    });
});