require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Database = require('./config/database');
const database = new Database();

// Import routes
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tasks', taskRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Todo List API',
    version: '1.0.0',
    endpoints: {
      users: {
        register: 'POST /api/users/register',
        login: 'POST /api/users/login',
        profile: 'GET /api/users/profile'
      },
      categories: {
        getAll: 'GET /api/categories',
        create: 'POST /api/categories',
        update: 'PUT /api/categories/:id',
        delete: 'DELETE /api/categories/:id'
      },
      tasks: {
        getAll: 'GET /api/tasks',
        getById: 'GET /api/tasks/:id',
        create: 'POST /api/tasks',
        update: 'PUT /api/tasks/:id',
        updateStatus: 'PATCH /api/tasks/:id/status',
        delete: 'DELETE /api/tasks/:id'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Handle specific error types
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format'
    });
  }
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await database.connect();
    console.log('Database connected successfully');
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
      console.log(`📍 API Base URL: http://localhost:${PORT}`);
      console.log(`📖 API Documentation: http://localhost:${PORT}`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
      console.log(`\n📋 Available Endpoints:`);
      console.log(`   Users: http://localhost:${PORT}/api/users`);
      console.log(`   Categories: http://localhost:${PORT}/api/categories`);
      console.log(`   Tasks: http://localhost:${PORT}/api/tasks`);
      console.log(`\n🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  try {
    await database.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
  try {
    await database.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();

module.exports = app;