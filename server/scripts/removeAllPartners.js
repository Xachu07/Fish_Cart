const dotenv = require('dotenv');
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();

async function main() {
  try {
    await connectDB();

    const result = await User.deleteMany({ role: 'partner' });

    console.log(`Removed ${result.deletedCount} delivery partner(s).`);
  } catch (err) {
    console.error('Error removing partners:', err);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.connection.close();
    } catch (_) {}
  }
}

main();
