import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all users that don't have a role field or have null role
    const users = await User.find({
      $or: [
        { role: { $exists: false } },
        { role: null }
      ]
    });

    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      // Set role based on isAdmin field if it exists, otherwise default to 'user'
      user.role = user.isAdmin ? 'admin' : 'user';
      await user.save();
      console.log(`Updated user ${user.email} with role: ${user.role}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateUsers();