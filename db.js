require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connectionString = process.env.DB_CONNECTION_STRING;
    await mongoose.connect(connectionString); 
    console.log('MongoDB Atlas connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
};

module.exports = connectDB;
