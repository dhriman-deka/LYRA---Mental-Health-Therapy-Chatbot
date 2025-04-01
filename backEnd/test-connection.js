import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function testConnection() {
  try {
    const mongoURI = process.env.MONGO;
    
    if (!mongoURI) {
      console.error("MongoDB connection string not found in environment variables");
      process.exit(1);
    }
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });
    
    console.log('Connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();