import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './db.js';
import foodRoutes from './foodRoutes.js';
import patientRoutes from './patientRoutes.js';
import dietPlanRoutes from './dietPlanRoutes.js';

// Load env configuration
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = process.env.CLIENT_URL ? [process.env.CLIENT_URL] : ['*'];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching client
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy blocked this origin.'));
    },
    credentials: true
  })
);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'AyuDiet Connect API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/foods', foodRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/plans', dietPlanRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on endpoint: ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('⚠️ Unhandled Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = Number(process.env.PORT) || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`AyuDiet API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

start().catch((error) => {
  console.error(`Unable to start AyuDiet API: ${error.message}`);
  process.exit(1);
});
