require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const courseRoutes = require('./routes/courseRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// 1) Connect to MongoDB
connectDB();

// 2) Configure CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',  
  optionsSuccessStatus: 200  
};

app.use(cors(corsOptions));  // Use CORS with options

// 3) Parse JSON
app.use(express.json());

// 4) Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// Health check or default route
app.get('/', (req, res) => {
  res.send('Spark OS API is running...');
});

// 5) Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
