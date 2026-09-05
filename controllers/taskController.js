const { validationResult } = require('express-validator');
const Database = require('../config/database');
const database = new Database();

class TaskController {
  // Get all tasks for the authenticated user
  async getTasks(req, res) {
    try {
      const db = database.getDb();
      const userId = req.user.id;
      const { status, priority, category_id, page = 1, limit = 10, search } = req.query;

      let query = `
        SELECT t.*, c.name as category_name, c.color as category_color 
        FROM tasks t 
        LEFT JOIN categories c ON t.category_id = c.id 
        WHERE t.user_id = ?
      `;
      let params = [userId];

      // Add filters
      if (status) {
        query += ' AND t.status = ?';
        params.push(status);
      }
      if (priority) {
        query += ' AND t.priority = ?';
        params.push(priority);
      }
      if (category_id) {
        query += ' AND t.category_id = ?';
        params.push(category_id);
      }
      if (search) {
        query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY t.created_at DESC';

      // Add pagination
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);

      const tasks = await new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM tasks WHERE user_id = ?';
      let countParams = [userId];

      if (status) {
        countQuery += ' AND status = ?';
        countParams.push(status);
      }
      if (priority) {
        countQuery += ' AND priority = ?';
        countParams.push(priority);
      }
      if (category_id) {
        countQuery += ' AND category_id = ?';
        countParams.push(category_id);
      }
      if (search) {
        countQuery += ' AND (title LIKE ? OR description LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`);
      }

      const totalCount = await new Promise((resolve, reject) => {
        db.get(countQuery, countParams, (err, row) => {
          if (err) reject(err);
          resolve(row.total);
        });
      });

      res.json({
        success: true,
        message: 'Tasks retrieved successfully',
        data: {
          tasks,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(totalCount / limit),
            total_items: totalCount,
            items_per_page: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get single task by ID
  async getTaskById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const db = database.getDb();

      const task = await new Promise((resolve, reject) => {
        db.get(
          `SELECT t.*, c.name as category_name, c.color as category_color 
           FROM tasks t 
           LEFT JOIN categories c ON t.category_id = c.id 
           WHERE t.id = ? AND t.user_id = ?`,
          [id, userId],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      res.json({
        success: true,
        message: 'Task retrieved successfully',
        data: {
          task
        }
      });
    } catch (error) {
      console.error('Get task error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Create new task
  async createTask(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { title, description, priority, due_date, category_id } = req.body;
      const userId = req.user.id;
      const db = database.getDb();

      // Validate category belongs to user if provided
      if (category_id) {
        const category = await new Promise((resolve, reject) => {
          db.get(
            'SELECT * FROM categories WHERE id = ? AND user_id = ?',
            [category_id, userId],
            (err, row) => {
              if (err) reject(err);
              resolve(row);
            }
          );
        });

        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Invalid category ID'
          });
        }
      }

      // Insert new task
      const result = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO tasks (title, description, priority, due_date, category_id, user_id) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [title, description, priority || 'medium', due_date, category_id, userId],
          function(err) {
            if (err) reject(err);
            resolve({ id: this.lastID });
          }
        );
      });

      // Get the created task with category info
      const task = await new Promise((resolve, reject) => {
        db.get(
          `SELECT t.*, c.name as category_name, c.color as category_color 
           FROM tasks t 
           LEFT JOIN categories c ON t.category_id = c.id 
           WHERE t.id = ?`,
          [result.id],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: {
          task
        }
      });
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update task
  async updateTask(req, res) {
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
      const { title, description, status, priority, due_date, category_id } = req.body;
      const userId = req.user.id;
      const db = database.getDb();

      // Check if task exists and belongs to user
      const existingTask = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
          [id, userId],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      if (!existingTask) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      // Validate category belongs to user if provided
      if (category_id) {
        const category = await new Promise((resolve, reject) => {
          db.get(
            'SELECT * FROM categories WHERE id = ? AND user_id = ?',
            [category_id, userId],
            (err, row) => {
              if (err) reject(err);
              resolve(row);
            }
          );
        });

        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Invalid category ID'
          });
        }
      }

      // Update task
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE tasks SET 
           title = ?, description = ?, status = ?, priority = ?, 
           due_date = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ? AND user_id = ?`,
          [
            title || existingTask.title,
            description !== undefined ? description : existingTask.description,
            status || existingTask.status,
            priority || existingTask.priority,
            due_date !== undefined ? due_date : existingTask.due_date,
            category_id !== undefined ? category_id : existingTask.category_id,
            id,
            userId
          ],
          function(err) {
            if (err) reject(err);
            resolve();
          }
        );
      });

      // Get updated task with category info
      const updatedTask = await new Promise((resolve, reject) => {
        db.get(
          `SELECT t.*, c.name as category_name, c.color as category_color 
           FROM tasks t 
           LEFT JOIN categories c ON t.category_id = c.id 
           WHERE t.id = ?`,
          [id],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      res.json({
        success: true,
        message: 'Task updated successfully',
        data: {
          task: updatedTask
        }
      });
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update task status only
  async updateTaskStatus(req, res) {
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
      const { status } = req.body;
      const userId = req.user.id;
      const db = database.getDb();

      // Check if task exists and belongs to user
      const existingTask = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
          [id, userId],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      if (!existingTask) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      // Update task status
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
          [status, id, userId],
          function(err) {
            if (err) reject(err);
            resolve();
          }
        );
      });

      // Get updated task with category info
      const updatedTask = await new Promise((resolve, reject) => {
        db.get(
          `SELECT t.*, c.name as category_name, c.color as category_color 
           FROM tasks t 
           LEFT JOIN categories c ON t.category_id = c.id 
           WHERE t.id = ?`,
          [id],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      res.json({
        success: true,
        message: 'Task status updated successfully',
        data: {
          task: updatedTask
        }
      });
    } catch (error) {
      console.error('Update task status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete task
  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const db = database.getDb();

      // Check if task exists and belongs to user
      const existingTask = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
          [id, userId],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      if (!existingTask) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      // Delete task
      await new Promise((resolve, reject) => {
        db.run(
          'DELETE FROM tasks WHERE id = ? AND user_id = ?',
          [id, userId],
          function(err) {
            if (err) reject(err);
            resolve();
          }
        );
      });

      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new TaskController();