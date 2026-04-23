require('dotenv').config();
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Parse JSON requests

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

const path = require('path');

// We import our actual routes here
const authRoutes = require('./routes/auth');
const negociosRoutes = require('./routes/negocios');
const uploadRoutes = require('./routes/upload');

app.use('/api/auth', authRoutes);
app.use('/api/negocios', negociosRoutes);
app.use('/api/upload', uploadRoutes);

// Servir la carpeta de imágenes públicamente
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
