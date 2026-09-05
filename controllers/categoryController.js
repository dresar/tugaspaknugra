const { validationResult } = require('express-validator');
const Database = require('../config/database');
const database = new Database();

class CategoryController {
  // Get all categories for the authenticated user
  async getCategories(req, res) {
    try {
      const db = database.getDb();
      const userId = req.user.id;

      const categories = await new Promise((resolve, reject) => {
        db.all(
          'SELECT * FROM categories WHERE user_id = ? ORDER BY created_at DESC',
          [userId],
          (err, rows) => {
            if (err) reject(err);
            resolve(rows);
          }
        );
      });

      res.json({
        success: true,
        message: 'Categories retrieved successfully',
        data: {
          categories
        }
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Create new category
  async createCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { name, color } = req.body;
      const userId = req.user.id;
      const db = database.getDb();

      // Check if category with same name exists for this user
      const existingCategory = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM categories WHERE name = ? AND user_id = ?',
          [name, userId],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }

      // Insert new category
      const result = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO categories (name, color, user_id) VALUES (?, ?, ?)',
          [name, color || '#007bff', userId],
          function(err) {
            if (err) reject(err);
            resolve({ id: this.lastID });
          }
        );
      });

      // Get the created category
      const category = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM categories WHERE id = ?',
          [result.id],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: {
          category
        }
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update category
  async updateCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { name, color } = req.body;
      const userId = req.user.id;
      const db = database.getDb();

      // Check if category exists and belongs to user
      const existingCategory = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM categories WHERE id = ? AND user_id = ?',
          [id, userId],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Check if another category with same name exists
      const duplicateCategory = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM categories WHERE name = ? AND user_id = ? AND id != ?',
          [name, userId, id],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      if (duplicateCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }

      // Update category
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE categories SET name = ?, color = ? WHERE id = ? AND user_id = ?',
          [name, color || existingCategory.color, id, userId],
          function(err) {
            if (err) reject(err);
            resolve();
          }
        );
      });

      // Get updated category
      const updatedCategory = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM categories WHERE id = ?',
          [id],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: {
          category: updatedCategory
        }
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete category
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const db = database.getDb();

      // Check if category exists and belongs to user
      const existingCategory = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM categories WHERE id = ? AND user_id = ?',
          [id, userId],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Delete category (tasks will have category_id set to NULL due to ON DELETE SET NULL)
      await new Promise((resolve, reject) => {
        db.run(
          'DELETE FROM categories WHERE id = ? AND user_id = ?',
          [id, userId],
          function(err) {
            if (err) reject(err);
            resolve();
          }
        );
      });

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new CategoryController();