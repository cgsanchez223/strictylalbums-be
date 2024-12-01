const spotifyController = require('../../controllers/spotifyController');
const spotifyService = require('../../services/spotifyServices');

// Mock the spotify service
jest.mock('../../services/spotifyServices', () => ({
    searchAlbums: jest.fn(),
    getAlbumDetails: jest.fn()
}));

describe('Spotify Controller', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        // Rest all mocks
        jest.clearAllMocks();

        // Mock response object
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Mock console.error to avoid cluttering test output
        console.error = jest.fn();
    });

    describe('searchAlbums', () => {
        beforeEach(() => {
            mockReq = {
                query: {
                    query: 'test album',
                    limit: '10',
                    offset: '0'
                }
            };
        });

        it('should successfully search for albums', async () => {
            const mockResults = {
                albums: {
                    items: [
                        { id: '1', name: 'Test Album 1' },
                        { id: '2', name: 'Test Album 2' }
                    ]
                }
            };

            spotifyService.searchAlbums.mockResolvedValue(mockResults);

            await spotifyController.searchAlbums(mockReq, mockRes);

            expect(spotifyService.searchAlbums).toHaveBeenCalledWith(
                mockReq.query.query,
                mockReq.query.limit,
                mockReq.query.offset
            );
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockResults
            });
        });

        it('should return 400 if query is missing', async () => {
            mockReq.query.query = '';

            await spotifyController.searchAlbums(mockReq, mockRes);

            expect(spotifyService.searchAlbums).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Search query is required'
            });
        });

        it('should handle service errors', async () => {
            const error = new Error('Spotify API error');
            spotifyService.searchAlbums.mockRejectedValue(error);

            await spotifyController.searchAlbums(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Error searching albums',
                error: expect.any(String)
            });
        });
    });

    describe('getAlbumDetails', () => {
        beforeEach(() => {
            mockReq = {
                params: {
                    id: '123'
                }
            };
        });

        it('should successfully get album details', async () => {
            const mockAlbum = {
                id: '123',
                name: 'Test Album',
                artists: [{ name: 'Test Artist' }],
                images: [{ url: 'http://example.com/image.jpg' }]
            };

            spotifyService.getAlbumDetails.mockResolvedValue(mockAlbum);

            await spotifyController.getAlbumDetails(mockReq, mockRes);

            expect(spotifyService.getAlbumDetails).toHaveBeenCalledWith(
                mockReq.params.id
            );
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockAlbum
            });
        });

        it('should return 400 if album ID is missing', async () => {
            mockReq.params.id = '';

            await spotifyController.getAlbumDetails(mockReq, mockRes);

            expect(spotifyService.getAlbumDetails).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Album ID is required'
            });
        });

        it('should handle service errors', async () => {
            const error = new Error('Spotify API error');
            spotifyService.getAlbumDetails.mockRejectedValue(error);

            await spotifyController.getAlbumDetails(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Error getting album details',
                error: expect.any(String)
            });
        });

        it('should handle development enviornment errors', async () => {
            process.env.NODE_ENV = 'development';
            const error = new Error('Spotify API error');
            spotifyService.getAlbumDetails.mockRejectedValue(error);

            await spotifyController.getAlbumDetails(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Error getting album details',
                error: error.message
            });
        });
    });
});