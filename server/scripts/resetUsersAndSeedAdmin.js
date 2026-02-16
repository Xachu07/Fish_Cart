const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();

async function main() {
  try {
    await connectDB();

    const deleteResult = await User.deleteMany({});

    const hashedPassword = await bcrypt.hash('admin', 10);

    const admin = await User.create({
      name: 'FishCart Admin',
      email: 'fishcart@gmail.com', // stored lowercased by schema
      password: hashedPassword,
      phone: '',
      address: '',
      role: 'admin',
      // If your schema still has status, make admin usable immediately
      status: 'approved',
    });

    console.log(`Deleted users: ${deleteResult.deletedCount}`);
    console.log(`Seeded admin: ${admin.email} (role: ${admin.role})`);
  } catch (err) {
    console.error('Reset/seed failed:', err);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.connection.close();
    } catch (_) {
      // ignore
    }
  }
}

main();

