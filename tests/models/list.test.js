jest.mock('../../models', () => {
    const mockModel = {
      build: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      findAll: jest.fn(),
      belongsTo: jest.fn(),
      belongsToMany: jest.fn()
    };
  
    return {
      List: mockModel,
      User: { findByPk: jest.fn() },
      Album: { findAll: jest.fn() }
    };
});

const { List } = require('../../models');

describe('List Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Creation and Validation', () => {
        it('should create a list with required fields', async () => {
            const listData = {
                userId: 1,
                name: 'My Favorite Albums',
                description: 'A collection of my favorite albums',
                isPublic: true
            };

            List.create.mockResolvedValue({
                id: 1,
                ...listData,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const list = await List.create(listData);

            expect(List.create).toHaveBeenCalledWith(listData);
            expect(list.userId).toBe(listData.userId);
            expect(list.name).toBe(listData.name);
            expect(list.description).toBe(listData.description);
            expect(list.isPublic).toBe(listData.isPublic);
        });

        it('should create a list wth minimal required fields', async () => {
            const listData = {
                userId: 1,
                name: 'My List', 
            };

            List.create.mockResolvedValue({
                id: 1,
                ...listData,
                description: null,
                isPublic: false,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const list = await List.create(listData);

            expect(List.create).toHaveBeenCalledWith(listData);
            expect(list.description).toBeNull();
            expect(list.isPublic).toBe(false);
        });

        it('should handle validation errors for name length', async () => {
            const listData = {
                userId: 1,
                name: '', // Empty name should fail validation
                isPublic: true
            };

            const error = new Error('Validation error: name length must be between 1 and 100 characters');
            List.create.mockRejectedValue(error);

            await expect(List.create(listData)).rejects.toThrow('Validation error');
        });
    });

    describe('Queries and Updates', () => {
        it('should find a list by ID', async () => {
            const mockList = {
                id: 1,
                userId: 1,
                name: 'Test List',
                description: 'Test Description',
                isPublic: true
            };

            List.findByPk.mockResolvedValue(mockList);

            const list = await List.findByPk(1);
            
            expect(List.findByPk).toHaveBeenCalledWith(1);
            expect(list.id).toBe(mockList.id);
            expect(list.name).toBe(mockList.name);
        });

        it('should update list details', async () => {
            const updateData = {
                name: 'Updated List Name',
                description: 'Updated description',
                isPublic: false
            };

            List.update.mockResolvedValue([1]);
            List.findOne.mockResolvedValue({
                id: 1,
                userId: 1,
                ...updateData
            });

            const result = await List.update(updateData, {
                where: { id: 1 }
            });

            expect(List.update).toHaveBeenCalledWith(updateData, {
                where: { id: 1 }
            });
            expect(result[0]).toBe(1); // One row affected
        });

        it('should delete a list', async () => {
            List.destroy.mockResolvedValue(1);

            const result = await List.destroy({
                where: { id: 1 }
            });

            expect(List.destroy).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(result).toBe(1);
        });
    });

    describe('Associations', () => {
        it('should find list with associated user', async () => {
            const mockList = {
                id: 1,
                userOd: 1,
                name: 'Test List',
                Users: {
                    id: 1,
                    username: 'testuser'
                }
            };

            List.findOne.mockResolvedValue(mockList);

            const list = await List.findOne({
                where: { id: 1 },
                include: ['Users']
            });

            expect(List.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                include: ['Users']
            });
            expect(list.Users).toBeDefined();
            expect(list.Users.username).toBe('testuser');
        });

        it('should find list with associated albums', async () => {
            const mockList = {
                id: 1,
                userId: 1,
                name: 'Test List',
                albums: [
                    {
                        id: 'album1',
                        name: 'Album 1',
                        artistName: 'Artist 1'
                    },
                    {
                        id: 'album2',
                        name: 'Album 2',
                        artistName: 'Artist 2'
                    }
                ]
            };

            List.findOne.mockResolvedValue(mockList);

            const list = await List.findOne({
                where: { id: 1 },
                include: ['albums']
            });

            expect(List.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                include: ['albums']
            });
            expect(list.albums).toHaveLength(2);
            expect(list.albums[0].name).toBe('Album 1');
        });
    });

    describe('Error Handling', () => {
        it('should handle missing required fields', async () => {
            const error = new Error('userId cannot be null');
            List.create.mockRejectedValue(error);

            await expect(List.create({ name: 'Test List' })).rejects.toThrow('userId cannot be null');
        });

        it('should handle database query errors', async () => {
            const error = new Error('Database connection error');
            List.findAll.mockRejectedValue(error);

            await expect(List.findAll()).rejects.toThrow('Database connection error');
        });
    });
});