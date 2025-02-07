import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log('Connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();