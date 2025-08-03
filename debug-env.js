import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

console.log('=== Environment Variables Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

console.log('\n=== Database Connection Test ===');
try {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected:', conn.connection.host);
  
  // Test basic query
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('📊 Available collections:', collections.map(c => c.name));
  
  await mongoose.disconnect();
  console.log('✅ Database test completed successfully');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
}

process.exit(0);