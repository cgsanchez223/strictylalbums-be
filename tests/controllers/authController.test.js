// tests/controllers/auth.controller.test.js
const authController = require('../../controllers/authController');
const { User } = require('../../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// Mocks
jest.mock('../../models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn()
  }
}));

jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn()
}));

describe('Auth Controller', () => {
  let mockReq;
  let mockRes;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup process.env
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRATION = '24h';
    
    // Mock response object
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Mock console.error to avoid cluttering test output
    console.error = jest.fn();
  });

  describe('register', () => {
    beforeEach(() => {
      mockReq = {
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          avatar_url: 'https://example.com/avatar.jpg'
        }
      };
    });

    it('should successfully register a new user', async () => {
      // Mock user not existing
      User.findOne.mockResolvedValue(null);
      
      // Mock password hashing
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      
      // Mock user creation
      const mockCreatedUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        avatar_url: 'https://example.com/avatar.jpg',
        description: null,
        createdAt: new Date()
      };
      User.create.mockResolvedValue(mockCreatedUser);

      await authController.register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: {
          user: expect.objectContaining({
            id: mockCreatedUser.id,
            username: mockCreatedUser.username,
            email: mockCreatedUser.email
          }),
          token: expect.any(String)
        }
      });
    });

    it('should return 400 if user already exists', async () => {
      User.findOne.mockResolvedValue({ id: 1 });

      await authController.register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User with this username or email already exists'
      });
    });
  });

  describe('login', () => {
    beforeEach(() => {
      mockReq = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      };
    });

    it('should successfully log in a user', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        avatar_url: 'https://example.com/avatar.jpg',
        description: 'Test description',
        createdAt: new Date()
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: {
          user: expect.objectContaining({
            id: mockUser.id,
            username: mockUser.username,
            email: mockUser.email
          }),
          token: expect.any(String)
        }
      });
    });

    it('should return 401 for invalid credentials', async () => {
      User.findOne.mockResolvedValue({
        password_hash: 'hashedPassword'
      });
      bcrypt.compare.mockResolvedValue(false);

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password'
      });
    });
  });

  describe('verifySession', () => {
    beforeEach(() => {
      mockReq = {
        headers: {
          authorization: 'Bearer validtoken'
        }
      };
    });

    it('should successfully verify a valid session', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      };

      jwt.verify = jest.fn().mockReturnValue({ id: 1 });
      User.findByPk.mockResolvedValue(mockUser);

      await authController.verifySession(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: mockUser,
          token: 'validtoken'
        }
      });
    });

    it('should return 401 for invalid token', async () => {
      mockReq.headers.authorization = 'Bearer invalidtoken';
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authController.verifySession(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired token'
      });
    });
  });
});