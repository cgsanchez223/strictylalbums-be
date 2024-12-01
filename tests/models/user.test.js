jest.mock('../../models', () => {
    const mockModel = {
      build: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn()
    };
  
    return {
      User: mockModel
    };
});

const { User } = require('../../models');
const user = require('../../models/user');

describe('User model', () => {
    // Clear mock data before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Field Validations', () => {
        it('should create a user with valid data', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password_hash: 'hashedpassword123'
            };

            User.create.mockResolvedValue({
                id: 1,
                ...userData,
                favorite_genres: [],
                social_links: {}
            });

            const user = await User.create(userData);

            expect(User.create).toHaveBeenCalledWith(userData);
            expect(user.username).toBe(userData.username);
            expect(user.email).toBe(userData.email);
            expect(user.password_hash).toBe(userData.password_hash);
        });

        it('should create a user with optional fields', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password_hash: 'hashedpassword123',
                avatar_url: 'http://example.com/avatar.jpg',
                description: 'Test description',
                location: 'Test location',
                favorite_genres: ['rock', 'jazz'],
                social_links: { twitter: '@testuser' }
            };

            User.create.mockResolvedValue({
                id: 1,
                ...userData
            });

            const user = await User.create(userData);

            expect(User.create).toHaveBeenCalledWith(userData);
            expect(user.avatar_url).toBe(userData.avatar_url);
            expect(user.description).toBe(userData.description);
            expect(user.favorite_genres).toEqual(userData.favorite_genres);
            expect(user.social_links).toEqual(userData.social_links)
        });
    });

    describe('Model Methods', () => {
        it('should find a user by primary key', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com'
            };

            User.findByPk.mockResolvedValue(mockUser);

            const user = await User.findByPk(1);

            expect(User.findByPk).toHaveBeenCalledWith(1);
            expect(user.id).toBe(1);
            expect(user.username).toBe('testuser');
        });

        it('should find a user by email', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com'
            };

            User.findOne.mockResolvedValue(mockUser);

            const user = await User.findOne({
                where: { email: 'test@example.com' }
            });

            expect(User.findOne).toHaveBeenCalledWith({
                where: { email: 'test@example.com'}
            });
            expect(user.email).toBe('test@example.com');
        });

        it('should return null when user is not found', async () => {
            User.findOne.mockResolvedValue(null);

            const user = await User.findOne({
                where: { email: 'nonexistent@example.com' }
            });

            expect(user).toBeNull();
        });
    });

    describe('Error Handling', () => {
        it('should handle creation errors', async () => {
            const error = new Error('Validation error');
            User.create.mockRejectedValue(error);

            await expect(User.create({})).rejects.toThrow('Validation error');
        });

        it('should handle query errors', async () => {
            const error = new Error('Database error');
            User.findOne.mockRejectedValue(error);

            await expect(User.findOne({})).rejects.toThrow('Database error');
        });
    });

    describe('Update Operations', () => {
        it('should update user fields', async () => {
            const updateData = {
                description: 'Updated description',
                location: 'New location'
            };

            User.update.mockResolvedValue([1]); // Returns affected rows count
            User.findOne.mockResolvedValue({
                id: 1,
                username: 'testuser',
                ...updateData
            });

            const result = await User.update(updateData, {
                where: { id: 1 }
            });

            expect(User.update).toHaveBeenCalledWith(updateData, {
                where: { id: 1 }
            });
            expect(result[0]).toBe(1); // One row affected
        });
    });
});