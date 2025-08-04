const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    
    // Check existing orders
    console.log('=== Existing Orders ===');
    const orders = await db.collection('orders').find({}).limit(5).toArray();
    console.log('Total orders:', await db.collection('orders').countDocuments());
    orders.forEach((order, i) => {
      console.log(`Order ${i+1}:`, {
        _id: order._id,
        orderNumber: order.orderNumber,
        user: order.user,
        total: order.total
      });
    });
    
    console.log('\n=== Indexes on orders collection ===');
    const indexes = await db.collection('orders').indexes();
    indexes.forEach(index => {
      console.log('Index:', index.name, 'Keys:', index.key);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabase();
