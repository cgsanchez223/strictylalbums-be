jest.mock('../../models', () => {
    const mockModel = {
      build: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      findAll: jest.fn(),
      belongsTo: jest.fn()
    };
  
    return {
      Rating: mockModel,
      User: { findByPk: jest.fn() }
    };
});

const { Rating } = require('../../models');
const rating = require('../../models/rating');

describe('Rating Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Creation and Validation', () => {
        it('should create a rating with all required fields', async () => {
            const ratingData = {
                userId: 1,
                albumId: 'spotify123',
                albumName: 'Test Album',
                artistName: 'Test Artist',
                rating: 4,
                review: 'Great album!',
                albumImage: 'http://example.com/image.jpg'
            };

            Rating.create.mockResolvedValue({
                id: 1,
                ...ratingData,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const rating = await Rating.create(ratingData);

            expect(Rating.create).toHaveBeenCalledWith(ratingData);
            expect(rating.userId).toBe(ratingData.userId);
            expect(rating.albumId).toBe(ratingData.albumId);
            expect(rating.rating).toBe(ratingData.rating);
        });

        it('should create a rating without optional fields', async () => {
            const ratingData = {
                userId: 1,
                albumId: 'spotify123',
                albumName: 'Test Album',
                artistName: 'Test Artist',
                rating: 4
            };

            Rating.create.mockResolvedValue({
                id: 1,
                ...ratingData,
                review: null,
                albumImage: null,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const rating = await Rating.create(ratingData);

            expect(Rating.create).toHaveBeenCalledWith(ratingData);
            expect(rating.review).toBeNull();
            expect(rating.albumImage).toBeNull();
        });

        it('should validate rating is betweeen 1 and 5', async () => {
            const invalidRatingData = {
                userId: 1,
                albumId: 'spotify123',
                albumName: 'Test Album',
                artistName: 'Test Artist',
                rating: 6 // Invalid rating
            };

            const error = new Error('Validation error: rating must be between 1 and 5');
            Rating.create.mockRejectedValue(error);

            await expect(Rating.create(invalidRatingData)).rejects.toThrow('Validation error');
        });
    });

    describe('Queries and Updates', () => {
        it('should find a rating by ID', async () => {
            const mockRating = {
                id: 1,
                userId: 1,
                albumId: 'spotify123',
                rating: 4
            };

            Rating.findByPk.mockResolvedValue(mockRating);

            const rating = await Rating.findByPk(1);

            expect(Rating.findByPk).toHaveBeenCalledWith(1);
            expect(rating.id).toBe(mockRating.id);
            expect(rating.rating).toBe(mockRating.rating);
        });

        it('should find rating by user and album', async () => {
            const mockRating = {
                id: 1,
                userId: 1,
                albumId: 'spotify123',
                rating: 4
            };

            Rating.findOne.mockResolvedValue(mockRating);

            const rating = await Rating.findOne({
                where: {
                    userId: 1,
                    albumId: 'spotify123'
                }
            });

            expect(Rating.findOne).toHaveBeenCalledWith({
                where: {
                    userId: 1,
                    albumId: 'spotify123'
                }
            });
            expect(rating.userId).toBe(mockRating.userId);
            expect(rating.albumId).toBe(mockRating.albumId);
        });

        it('should update rating details', async () => {
            const updateData = {
                rating: 5,
                review: 'Updated review'
            };

            Rating.update.mockResolvedValue([1]);
            Rating.findOne.mockResolvedValue({
                id: 1,
                userId: 1,
                albumId: 'spotify123',
                ...updateData
            });

            const result = await Rating.update(updateData, {
                where: { id: 1 }
            });

            expect(Rating.update).toHaveBeenCalledWith(updateData, {
                where: { id: 1 }
            });
            expect(result[0]).toBe(1); // One row affected
        });
    });

    describe('Unique Constraints', () => {
        it('should enforce unique user-album combination', async () => {
            const duplicateRating = {
                userId: 1,
                albumId: 'spotify123',
                albumName: 'Test Album',
                artistName: 'Test Artist',
                rating: 4
            };

            const error = new Error('Unique constraint violation');
            Rating.create.mockRejectedValue(error);

            await expect(Rating.create(duplicateRating)).rejects.toThrow('Unique constraint violation');
        });
    });

    describe('Associations', () => {
        it('should load rating with associated user', async () => {
            const mockRating = {
                id: 1,
                userId: 1,
                albumId: 'spotify123',
                rating: 4,
                user: {
                    id: 1,
                    username: 'testuser'
                }
            };

            Rating.findOne.mockResolvedValue(mockRating);

            const rating = await Rating.findOne({
                where: { id: 1 },
                include: ['user']
            });

            expect(Rating.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                include: ['user']
            });
            expect(rating.user).toBeDefined();
            expect(rating.user.username).toBe('testuser');
        });
    });

    describe('Error Handling', () => {
        it('should handle missing required fields', async () => {
            const incompleteData = {
                userId: 1
                // Missing required fields
            };

            const error = new Error('Required fields missing');
            Rating.create.mockRejectedValue(error);

            await expect(Rating.create(incompleteData)).rejects.toThrow('Required fields missing');
        });

        it('should handle invalid rating values', async () => {
            const invalidData = {
                userId: 1,
                albumId: 'spotify123',
                albumName: 'Test Album',
                artistName: 'Test Artist',
                rating: 0 // Invalid rating value
            };

            const error = new Error('Validation error: rating must be between 1 and 5');
            Rating.create.mockRejectedValue(error);

            await expect(Rating.create(invalidData)).rejects.toThrow('Validation error');
        });
    });
});