const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@'));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully!');
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    
    if (error.message.includes('IP')) {
      console.log('\n🔧 Possible solutions:');
      console.log('1. Add your IP address to MongoDB Atlas whitelist');
      console.log('2. Go to: https://cloud.mongodb.com');
      console.log('3. Navigate to: Network Access → Add IP Address');
      console.log('4. Click "Add Current IP Address"');
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testConnection();
