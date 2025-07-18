// server.js - Starter Express server for Week 2 assignment

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(morgan('dev')); // Request logging middleware

// Custom middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: 'Invalid token.' 
    });
  }
};

// Validation middleware
const validateProduct = (req, res, next) => {
  const { name, price } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ 
      success: false,
      error: 'Name and price are required fields.' 
    });
  }

  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ 
      success: false,
      error: 'Price must be a positive number.' 
    });
  }

  next();
};

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});


// TODO: Implement the following routes:
// GET /api/products - Get all products
// GET /api/products/:id - Get a specific product
// POST /api/products - Create a new product
// PUT /api/products/:id - Update a product
// DELETE /api/products/:id - Delete a product

// Example route implementation for GET /api/products
//app.get('/api/products', (req, res) => {
  //res.json(products);
//});

// GET /api/products - Get all products with filtering, pagination, and search
app.get('/api/products', (req, res) => {
  try {
    let results = [...products];
    const { search, minPrice, maxPrice, category, inStock, page = 1, limit = 10 } = req.query;

    // Filtering
    if (search) {
      results = results.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (minPrice) {
      results = results.filter(p => p.price >= Number(minPrice));
    }

    if (maxPrice) {
      results = results.filter(p => p.price <= Number(maxPrice));
    }

    if (category) {
      results = results.filter(p => p.category === category);
    }

    if (inStock) {
      results = results.filter(p => p.inStock === (inStock === 'true'));
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    // Response with pagination info
    res.json({
      success: true,
      count: paginatedResults.length,
      total: results.length,
      page: Number(page),
      pages: Math.ceil(results.length / limit),
      data: paginatedResults
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id - Get a specific product
app.get('/api/products/:id', (req, res, next) => {
  try {
    const product = products.find(p => p.id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }
    
    res.json({ 
      success: true,
      data: product 
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/products - Create a new product (authenticated)
app.post('/api/products', authenticate, validateProduct, (req, res, next) => {
  try {
    const newProduct = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    
    res.status(201).json({ 
      success: true,
      data: newProduct 
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id - Update a product (authenticated)
app.put('/api/products/:id', authenticate, validateProduct, (req, res, next) => {
  try {
    const index = products.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }
    
    const updatedProduct = {
      ...products[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    products[index] = updatedProduct;
    
    res.json({ 
      success: true,
      data: updatedProduct 
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id - Delete a product (authenticated)
app.delete('/api/products/:id', authenticate, (req, res, next) => {
  try {
    const index = products.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }
    
    products.splice(index, 1);
    
    res.json({ 
      success: true,
      data: {} 
    });
  } catch (err) {
    next(err);
  }
});



// TODO: Implement custom middleware for:
// - Request logging
// - Authentication
// - Error handling

// Login route to get JWT token (for testing)
app.post('/api/login', (req, res) => {
  // In a real app, you would validate credentials against a database
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign(
      { username, role: 'admin' }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    return res.json({ 
      success: true,
      token 
    });
  }
  
  res.status(401).json({ 
    success: false,
    error: 'Invalid credentials' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found' 
  });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app; 