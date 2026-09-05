const express = require('express');
const { body, param } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createCategoryValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name must be between 1 and 100 characters')
    .trim(),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color code (e.g., #FF0000)')
];

const updateCategoryValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name must be between 1 and 100 characters')
    .trim(),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color code (e.g., #FF0000)')
];

const deleteCategoryValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer')
];

// All routes require authentication
router.use(authenticateToken);

// Routes
router.get('/', categoryController.getCategories);
router.post('/', createCategoryValidation, categoryController.createCategory);
router.put('/:id', updateCategoryValidation, categoryController.updateCategory);
router.delete('/:id', deleteCategoryValidation, categoryController.deleteCategory);

module.exports = router;