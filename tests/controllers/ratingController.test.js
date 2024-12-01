const ratingController = require('../../controllers/ratingController');
const { Rating, User } = require('../../models');

// Mock the models
jest.mock('../../models', () => ({
    Rating: {
        findOne: jest.fn(),
        create: jest.fn(),
        findAndCountAll: jest.fn(),
        destroy: jest.fn()
    },
    User: {}
}));

describe('Rating Controller', () => {
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

    describe('createRating', () => {
        beforeEach(() => {
            mockReq = {
                user: { id: 1 },
                body: {
                    albumId: '123',
                    albumName: 'Test Album',
                    artistName: 'Test Artist',
                    albumImage: 'http://example.com/image.jpg',
                    rating: 4,
                    review: 'Great album!'
                }
            };
        });

        it('should create a new rating successfully', async () => {
            Rating.findOne.mockResolvedValue(null);
            const mockCreatedRating = { ...mockReq.body, userId: mockReq.user.id };
            Rating.create.mockResolvedValue(mockCreatedRating);

            await ratingController.createRating(mockReq, mockRes);

            expect(Rating.create).toHaveBeenCalledWith({
                userId: mockReq.user.id,
                ...mockReq.body
            });
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Rating created successfully',
                data: mockCreatedRating
            });
        });

        it('should update existing rating successfully', async () => {
            const mockExistingRating = {
                update: jest.fn().mockResolvedValue({ ...mockReq.body, userId: mockReq.user.id })
            };

            Rating.findOne.mockResolvedValue(mockExistingRating);

            await ratingController.createRating(mockReq, mockRes);

            expect(mockExistingRating.update).toHaveBeenCalledWith({
                rating: mockReq.body.rating,
                review: mockReq.body.review,
                albumName: mockReq.body.albumName,
                artistName: mockReq.body.artistName,
                albumImage: mockReq.body.albumImage
            });
            expect(mockRes.status).toHaveBeenCalledWith(201);
        });

        it('should validate rating value', async () => {
            mockReq.body.rating = 6;

            await ratingController.createRating(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        });
    });

    describe('getAlbumRating', () => {
        beforeEach(() => {
            mockReq = {
                user: { id: 1 },
                params: { albumId: '123' }
            };
        });

        it('should get album rating successfully', async () => {
            const mockRating = {
                albumId: '123',
                rating: 4
            };
            Rating.findOne.mockResolvedValue(mockRating);

            await ratingController.getAlbumRating(mockReq, mockRes);

            expect(Rating.findOne).toHaveBeenCalledWith({
                where: {
                    userId: mockReq.user.id,
                    albumId: mockReq.params.albumId
                }
            });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockRating
            });
        });

        it('should return 404 when rating not found', async () => {
            Rating.findOne.mockResolvedValue(null);

            await ratingController.getAlbumRating(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Rating not found'
            });
        });
    });

    describe('getUserRatings', () => {
        beforeEach(() => {
            mockReq = {
                user: { id: 1 },
                query: { limit: '10', offset: '0' }
            };
        });

        it('should get user ratings with pagination', async () => {
            const mockRatings = {
                rows: [
                    { id: 1, rating: 4},
                    { id: 2, rating: 5 }
                ],
                count: 2
            };
            Rating.findAndCountAll.mockResolvedValue(mockRatings);

            await ratingController.getUserRatings(mockReq, mockRes);

            expect(Rating.findAndCountAll).toHaveBeenCalledWith({
                where: { userId: mockReq.user.id },
                order: [['createdAt', 'DESC']],
                limit: 10,
                offset: 0
            });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    ratings: mockRatings.rows,
                    total: mockRatings.count,
                    limit: 10,
                    offset: 0
                }
            });
        });
    });

    describe('deleteRating', () => {
        beforeEach(() => {
            mockReq = {
                user: { id: 1 },
                params: { id: '1' }
            };
        });

        it('should delete rating successfully', async () => {
            const mockRating = {
                destroy: jest.fn().mockResolvedValue(undefined)
            };
            Rating.findOne.mockResolvedValue(mockRating);

            await ratingController.deleteRating(mockReq, mockRes);

            expect(mockRating.destroy).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Rating deleted successfully'
            });
        });

        it('should return 404 when rating not found', async () => {
            Rating.findOne.mockResolvedValue(null);

            await ratingController.deleteRating(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Rating not found'
            });
        });
    });

    describe('getRecentRatings', () => {
        beforeEach(() => {
            mockReq = {
                query: { limit: '10', offset: '0' }
            };
        });

        it('should get recent rating with user data', async () => {
            const mockRatings = {
                rows: [
                    {
                        id: 1,
                        rating: 4,
                        user: {
                            id: 1,
                            username: 'testuser',
                            avatar_url: 'http://example.com/avatar.jpg'
                        }
                    }
                ],
                count: 1
            };
            Rating.findAndCountAll.mockResolvedValue(mockRatings);

            await ratingController.getRecentRatings(mockReq, mockRes);

            expect(Rating.findAndCountAll).toHaveBeenCalledWith({
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'avatar_url']
                }],
                order: [['createdAt', 'DESC']],
                limit: 10,
                offset: 0
            });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    ratings: mockRatings.rows,
                    total: mockRatings.count,
                    limit: 10,
                    offset: 0
                }
            });
        });
    });
});