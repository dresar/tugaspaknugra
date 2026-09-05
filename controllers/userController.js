const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const Database = require('../config/database');
const database = new Database();
const { generateToken } = require('../middleware/auth');

class UserController {
  // Register new user
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { username, email, password } = req.body;
      const db = database.getDb();

      // Check if user already exists
      const existingUser = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM users WHERE email = ? OR username = ?',
          [email, username],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email or username already exists'
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const result = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
          [username, email, hashedPassword],
          function(err) {
            if (err) reject(err);
            resolve({ id: this.lastID });
          }
        );
      });

      // Generate token
      const user = { id: result.id, username, email };
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: result.id,
            username,
            email
          },
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;
      const db = database.getDb();

      // Find user by email
      const user = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM users WHERE email = ?',
          [email],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate token
      const token = generateToken(user);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const db = database.getDb();
      const userId = req.user.id;

      const user = await new Promise((resolve, reject) => {
        db.get(
          'SELECT id, username, email, created_at FROM users WHERE id = ?',
          [userId],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new UserController();