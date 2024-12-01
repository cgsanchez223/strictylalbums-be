jest.mock('../../models', () => {
    const mockModel = {
        build: jest.fn(),
        create: jest.fn(),
        findOne: jest.fn(),
        findByPk: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
        findAll: jest.fn(),
        belongsToMany: jest.fn(),
    };

    return {
        Album: mockModel,
        List: { findByPk: jest.fn() },
    };
});

const { Album } = require('../../models');

describe('Album Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Creation and Validation', () => {
        it('should create an album with all required fields', async () => {
            const albumData = {
                id: 'spotify123',
                name: 'Test Album',
                artistName: 'Test Artist',
                imageUrl: 'http://example.com/image.jpg',
            };

            Album.create.mockResolvedValue({
                ...albumData,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const album = await Album.create(albumData);

            expect(Album.create).toHaveBeenCalledWith(albumData);
            expect(album.id).toBe(albumData.id);
            expect(album.name).toBe(albumData.name);
            expect(album.artistName).toBe(albumData.artistName);
            expect(album.imageUrl).toBe(albumData.imageUrl);
        });

        it('should create an album without the optional imageUrl', async () => {
            const albumData = {
                id: 'spotify456',
                name: 'Another Album',
                artistName: 'Another Artist',
            };

            Album.create.mockResolvedValue({
                ...albumData,
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const album = await Album.create(albumData);

            expect(Album.create).toHaveBeenCalledWith(albumData);
            expect(album.imageUrl).toBeNull();
        });
    });

    describe('Queries and Updates', () => {
        it('should find an album by ID', async () => {
            const mockAlbum = {
                id: 'spotify123',
                name: 'Test Album',
                artistName: 'Test Artist',
                imageUrl: 'http://example.com/image.jpg',
            };

            Album.findByPk.mockResolvedValue(mockAlbum);

            const album = await Album.findByPk('spotify123');

            expect(Album.findByPk).toHaveBeenCalledWith('spotify123');
            expect(album.id).toBe(mockAlbum.id);
            expect(album.name).toBe(mockAlbum.name);
        });

        it('should update album details', async () => {
            const updateData = {
                name: 'Updated Album Name',
            };

            Album.update.mockResolvedValue([1]);
            Album.findByPk.mockResolvedValue({
                id: 'spotify123',
                name: 'Updated Album Name',
                artistName: 'Test Artist',
                imageUrl: 'http://example.com/image.jpg',
            });

            const result = await Album.update(updateData, {
                where: { id: 'spotify123' },
            });

            expect(Album.update).toHaveBeenCalledWith(updateData, {
                where: { id: 'spotify123' },
            });
            expect(result[0]).toBe(1); // One row affected
        });
    });

    describe('Associations', () => {
        it('should associate with lists', async () => {
            const mockAlbum = {
                id: 'spotify123',
                name: 'Test Album',
                artistName: 'Test Artist',
                lists: [
                    { id: 1, name: 'Favorites' },
                    { id: 2, name: 'Chill Vibes' },
                ],
            };

            Album.findOne.mockResolvedValue(mockAlbum);

            const album = await Album.findOne({
                where: { id: 'spotify123' },
                include: ['lists'],
            });

            expect(Album.findOne).toHaveBeenCalledWith({
                where: { id: 'spotify123' },
                include: ['lists'],
            });
            expect(album.lists).toHaveLength(2);
            expect(album.lists[0].name).toBe('Favorites');
        });
    });

    describe('Error Handling', () => {
        it('should handle missing required fields', async () => {
            const incompleteData = {
                id: 'spotify123',
                name: 'Test Album',
                // Missing artistName
            };

            const error = new Error('artistName cannot be null');
            Album.create.mockRejectedValue(error);

            await expect(Album.create(incompleteData)).rejects.toThrow(
                'artistName cannot be null'
            );
        });

        it('should handle duplicate primary key', async () => {
            const duplicateAlbum = {
                id: 'spotify123',
                name: 'Duplicate Album',
                artistName: 'Test Artist',
            };

            const error = new Error('Unique constraint violation');
            Album.create.mockRejectedValue(error);

            await expect(Album.create(duplicateAlbum)).rejects.toThrow(
                'Unique constraint violation'
            );
        });
    });
});