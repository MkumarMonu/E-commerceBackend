import { body } from 'express-validator';

const userValidationRules = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isAlphanumeric().withMessage('Username must contain only letters and numbers')
    .trim()
    .toLowerCase(),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),

  // body('avatar')
  //   .notEmpty().withMessage('Avatar URL is required')
  //   .isURL().withMessage('Avatar must be a valid URL'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Invalid role, must be either "user" or "admin"'),
];


export {userValidationRules}