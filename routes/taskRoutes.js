const express = require('express');
const { body, param, query } = require('express-validator');
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createTaskValidation = [
  body('title')
    .isLength({ min: 1, max: 255 })
    .withMessage('Task title must be between 1 and 255 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
    .trim(),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date in ISO format (YYYY-MM-DD)'),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer')
];

const updateTaskValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer'),
  body('title')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Task title must be between 1 and 255 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
    .trim(),
  body('status')
    .optional()
    .isIn(['pending', 'completed'])
    .withMessage('Status must be either pending or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date in ISO format (YYYY-MM-DD)'),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer')
];

const updateTaskStatusValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer'),
  body('status')
    .isIn(['pending', 'completed'])
    .withMessage('Status must be either pending or completed')
];

const getTaskValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer')
];

const deleteTaskValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer')
];

const getTasksValidation = [
  query('status')
    .optional()
    .isIn(['pending', 'completed'])
    .withMessage('Status must be either pending or completed'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  query('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters')
    .trim()
];

// All routes require authentication
router.use(authenticateToken);

// Routes
router.get('/', getTasksValidation, taskController.getTasks);
router.get('/:id', getTaskValidation, taskController.getTaskById);
router.post('/', createTaskValidation, taskController.createTask);
router.put('/:id', updateTaskValidation, taskController.updateTask);
router.patch('/:id/status', updateTaskStatusValidation, taskController.updateTaskStatus);
router.delete('/:id', deleteTaskValidation, taskController.deleteTask);

module.exports = router;