import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }
  const mongoUri = process.env.MONGODB_URI;

  try {
    if (mongoUri && mongoUri.trim() !== '') {
      console.log('Connecting to provided MongoDB URI...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('Connected to MongoDB successfully.');
      return;
    }
  } catch (error) {
    console.warn('Failed to connect to external MongoDB URI. Falling back to in-memory MongoDB...', error);
  }

  // Fallback to MongoMemoryServer for reliable, zero-config local/cloud sandbox execution
  try {
    console.log('Starting in-memory MongoDB server (MongoMemoryServer)...');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`Connected to in-memory MongoDB at ${uri}`);
  } catch (err) {
    console.error('CRITICAL: Failed to initialize in-memory MongoDB:', err);
    throw err;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('MongoDB disconnected.');
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error);
  }
};
