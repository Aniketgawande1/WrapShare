// test-mongo.js
const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    console.log('Connection string:', process.env.MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@'));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas connected successfully!');
    
    // Test basic operations
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('✅ Test document inserted successfully!');
    
    const testDoc = await testCollection.findOne({ test: 'connection' });
    console.log('✅ Test document retrieved:', testDoc);
    
    // Clean up
    await testCollection.deleteOne({ test: 'connection' });
    console.log('✅ Test document cleaned up');
    
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

testConnection();
