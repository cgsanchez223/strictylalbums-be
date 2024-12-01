const listController = require('../../controllers/listController');
const { List, Album, User } = require('../../models');
const { Op } = require('sequelize');


jest.mock('../../models', () => ({
  List: {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn()
  },
  Album: {
    findOrCreate: jest.fn()
  },
  User: {}
}));

describe('List Controller', () => {
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

  describe('createList', () => {
    beforeEach(() => {
      mockReq = {
        body: {
          name: 'My Favorite Albums',
          description: 'A collection of my favorite albums',
          isPublic: true
        },
        user: {
          id: 1
        }
      };
    });

    it('should successfully create a new list', async () => {
      const mockList = {
        id: 1,
        ...mockReq.body,
        userId: mockReq.user.id
      };
      
      List.create.mockResolvedValue(mockList);

      await listController.createList(mockReq, mockRes);

      expect(List.create).toHaveBeenCalledWith({
        name: mockReq.body.name,
        description: mockReq.body.description,
        isPublic: mockReq.body.isPublic,
        userId: mockReq.user.id
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'List created successfully',
        data: mockList
      });
    });

    it('should handle errors during list creation', async () => {
      List.create.mockRejectedValue(new Error('Database error'));
      await listController.createList(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error creating list',
        error: expect.any(String)

      });
    });
  });
  describe('getUserLists', () => {
    beforeEach(() => {
      mockReq = {
        user: {
          id: 1
        }
      };
    });

    it('should return all lists for a user', async () => {
      const mockLists = [
        { id: 1, name: 'List 1', albums: [] },
        { id: 2, name: 'List 2', albums: [] }
      ];

      List.findAll.mockResolvedValue(mockLists);

      await listController.getUserLists(mockReq, mockRes);

      expect(List.findAll).toHaveBeenCalledWith({
        where: { userId: mockReq.user.id },
        include: [{
          model: Album,
          as: 'albums',
          through: { attributes: [] }
        }],
        order: [['createdAt', 'DESC']]
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockLists
      });
    });
  });

  describe('getList', () => {
    beforeEach(() => {
      mockReq = {
        params: { id: 1 },
        user: { id: 1 }
      };
    });

    it('should return a specific list if found', async () => {
      const mockList = {
        id: 1,
        name: 'Test List',
        albums: []
      };

      List.findOne.mockResolvedValue(mockList);

      await listController.getList(mockReq, mockRes);

      expect(List.findOne).toHaveBeenCalledWith({
        where: {
          id: mockReq.params.id,
          [Op.or]: [
            { userId: mockReq.user.id },
            { isPublic: true }
          ]
        },
        include: expect.any(Array)
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockList
      });
    });

    it('should return 404 if list is not found', async () => {
      List.findOne.mockResolvedValue(null);

      await listController.getList(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'List not found'
      });
    });
  });

  describe('updateList', () => {
    const mockUpdate = jest.fn();
    
    beforeEach(() => {
      mockReq = {
        params: { id: 1 },
        user: { id: 1 },
        body: {
          name: 'Updated List',
          description: 'Updated description',
          isPublic: false
        }
      };
    });

    it('should successfully update a list', async () => {
      const mockList = {
        id: 1,
        update: mockUpdate
      };

      List.findOne.mockResolvedValue(mockList);
      mockUpdate.mockResolvedValue(mockList);

      await listController.updateList(mockReq, mockRes);

      expect(mockUpdate).toHaveBeenCalledWith({
        name: mockReq.body.name,
        description: mockReq.body.description,
        isPublic: mockReq.body.isPublic
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'List updated successfully',
        data: mockList
      });
    });
  });

  describe('deleteList', () => {
    const mockDestroy = jest.fn();
    
    beforeEach(() => {
      mockReq = {
        params: { id: 1 },
        user: { id: 1 }
      };
    });

    it('should successfully delete a list', async () => {
      const mockList = {
        id: 1,
        destroy: mockDestroy
      };

      List.findOne.mockResolvedValue(mockList);
      mockDestroy.mockResolvedValue();

      await listController.deleteList(mockReq, mockRes);

      expect(mockDestroy).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'List deleted successfully'
      });
    });
  });

  describe('addAlbumToList', () => {
    const mockAddAlbum = jest.fn();
    
    beforeEach(() => {
      mockReq = {
        params: { listId: 1 },
        user: { id: 1 },
        body: {
          albumId: '123',
          albumName: 'Test Album',
          artistName: 'Test Artist',
          imageUrl: 'http://example.com/image.jpg'
        }
      };
    });

    it('should successfully add album to list', async () => {
      const mockList = {
        id: 1,
        addAlbum: mockAddAlbum
      };
      const mockAlbum = [{ id: '123' }, false];

      List.findOne.mockResolvedValue(mockList);
      Album.findOrCreate.mockResolvedValue(mockAlbum);
      mockAddAlbum.mockResolvedValue();

      await listController.addAlbumToList(mockReq, mockRes);

      expect(mockAddAlbum).toHaveBeenCalledWith(mockAlbum[0]);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Album added to list successfully'
      });
    });
  });

  describe('removeAlbumFromList', () => {
    const mockRemoveAlbum = jest.fn();
    
    beforeEach(() => {
      mockReq = {
        params: { 
          listId: 1,
          albumId: '123'
        },
        user: { id: 1 }
      };
    });

    it('should successfully remove album from list', async () => {
      const mockList = {
        id: 1,
        removeAlbum: mockRemoveAlbum
      };

      List.findOne.mockResolvedValue(mockList);
      mockRemoveAlbum.mockResolvedValue();

      await listController.removeAlbumFromList(mockReq, mockRes);

      expect(mockRemoveAlbum).toHaveBeenCalledWith(mockReq.params.albumId);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Album removed from list successfully'
      });
    });
  });
});