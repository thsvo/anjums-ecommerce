const express = require('express');
const cors = require('cors');
const next = require('next');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const reviewRoutes = require('./routes/reviews');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

// Serve static files from public directory
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date() });
});

// Handle all Next.js requests
app.all('*', (req, res) => {
  return handle(req, res);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Don't send stack trace in production
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({ 
    error: err.message || 'Something went wrong!',
    ...(isDev && { stack: err.stack })
  });
});

let server;

nextApp.prepare().then(() => {
  server = app.listen(PORT, () => {
    console.log(`> Server running on http://localhost:${PORT}`);
    console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`> Process ID: ${process.pid}`);
  });
  
  // Handle server errors
  server.on('error', (error) => {
    console.error('Server error:', {
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });
  });
  
}).catch(err => {
  console.error('Error starting server:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  process.exit(1);
});

// Enhanced beforeExit handler
process.on('beforeExit', async (code) => {
  console.log('Process beforeExit event with code:', code);
  
  try {
    await prisma.$disconnect();
    console.log('Database disconnected on beforeExit');
  } catch (error) {
    console.error('Error disconnecting database on beforeExit:', error);
  }
});

// Add warning handler for deprecated features
process.on('warning', (warning) => {
  console.warn('Process Warning:', {
    name: warning.name,
    message: warning.message,
    stack: warning.stack,
    timestamp: new Date().toISOString()
  });
});

// Enhanced error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    pid: process.pid
  });
  
  // Graceful shutdown
  console.log('Attempting graceful shutdown...');
  server?.close(() => {
    console.log('Server closed. Exiting process.');
    process.exit(1);
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
});

// Enhanced error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', {
    reason: reason instanceof Error ? {
      message: reason.message,
      stack: reason.stack
    } : reason,
    promise: promise.toString(),
    timestamp: new Date().toISOString(),
    pid: process.pid
  });
  
  // Don't exit immediately for promise rejections in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('Attempting graceful shutdown...');
    server?.close(() => {
      console.log('Server closed. Exiting process.');
      process.exit(1);
    });
    
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  }
});

// Enhanced SIGTERM handler
process.on('SIGTERM', async () => {
  console.log('SIGTERM received - starting graceful shutdown...');
  
  try {
    // Close server
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
      console.log('HTTP server closed');
    }
    
    // Disconnect from database
    await prisma.$disconnect();
    console.log('Database disconnected');
    
    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
  console.log('\nSIGINT received - starting graceful shutdown...');
  
  try {
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
      console.log('HTTP server closed');
    }
    
    await prisma.$disconnect();
    console.log('Database disconnected');
    
    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});
