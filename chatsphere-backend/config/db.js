import mongoose from 'mongoose';

/*
  connectDB
  ---------
  Connects to MongoDB Atlas using the MONGO_URI from .env
  Called once at server startup in index.js
  If connection fails the process exits so Railway/Render restarts it
*/
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
