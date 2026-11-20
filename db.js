import mongoose from 'mongoose';

/**
 * Connects to MongoDB using connection string in MONGO_URI
 */
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set. Copy .env.example to .env and configure MongoDB.');
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`🌿 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`, { cause: error });
  }
};

export default connectDB;
