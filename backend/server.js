require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const courseRoutes = require('./routes/courseRoutes');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require("./routes/fileRoutes");

const app = express();


// 1) Connect to MongoDB
connectDB();


// 2) CORS
const allowedOrigins = [
  'http://localhost:3000', // Dev frontend
  'https://your-production-domain.com', // Replace with real domain later
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow cookies/auth headers if needed
};

app.use(cors(corsOptions));


// 3) Parse JSON (with a limit to prevent errors)
app.use(express.json({ limit: '50mb' }));


// 4) Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use("/api/files", fileRoutes);


// 5) Health check route
app.get('/', (req, res) => {
  res.send('Spark OS API is running...');
});


// 6) Global Error Handling Middleware (Handles unexpected errors)
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});


// 7) Start Server
const PORT = process.env.PORT || 5100;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
