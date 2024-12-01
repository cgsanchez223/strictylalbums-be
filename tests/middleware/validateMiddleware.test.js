const { registerValidation, loginValidation, validate } = require('../../middleware/validateMiddleware');
const { validationResult } = require('express-validator');

// Mock express-validator
jest.mock('express-validator', () => ({
    validationResult: jest.fn(),
    check: jest.fn(() => ({
        trim: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        isEmpty: jest.fn().mockReturnThis(),
        withMessage: jest.fn().mockReturnThis(),
        isLength: jest.fn().mockReturnThis(),
        normalizeEmail: jest.fn().mockReturnThis(),
        isEmail: jest.fn().mockReturnThis(),
        custom: jest.fn().mockReturnThis()
    }))
}));

describe('Validation Middleware', () => {
    let mockReq;
    let mockRes;
    let nextFunction;

    beforeEach(() => {
        mockReq = {
            body: {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123'
            }
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextFunction = jest.fn();
    });

    describe('validate function', () => {
        it('should continue to next middleware if validation passes', () => {
            validationResult.mockReturnValue({
                isEmpty: () => true,
                array: () => []
            });

            validate(mockReq, mockRes, nextFunction);

            expect(nextFunction).toHaveBeenCalled();
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });

        it('should return 400 status with errors if validation fails', () => {
            const mockErrors = [
                {
                    param: 'email',
                    msg: 'Please provide a valid email address'
                },
                {
                    param: 'password',
                    msg: 'Password must be at least 6 characters long'
                }
            ];

            validationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => mockErrors
            });

            validate(mockReq, mockRes, nextFunction);

            expect(nextFunction).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                errors: mockErrors.map(err => ({
                    field: err.param,
                    message: err.msg
                }))
            });
        });
    });
});