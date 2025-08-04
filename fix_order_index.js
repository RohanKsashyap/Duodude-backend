import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const fixOrderIndex = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb+srv://ottodev7806:13131313SABs@duodude.lfutnzb.mongodb.net/?retryWrites=true&w=majority&appName=duodude");
    console.log('Connected to MongoDB');

    // Get the orders collection
    const db = mongoose.connection.db;
    const collection = db.collection('orders');

    // Check existing indexes
    console.log('Current indexes:');
    const indexes = await collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Drop the orderNumber index if it exists
    try {
      await collection.dropIndex('orderNumber_1');
      console.log('Successfully dropped orderNumber_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('orderNumber_1 index does not exist');
      } else {
        console.log('Error dropping index:', error.message);
      }
    }

    // Check indexes after dropping
    console.log('\nIndexes after dropping:');
    const indexesAfter = await collection.indexes();
    console.log(JSON.stringify(indexesAfter, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

fixOrderIndex();
