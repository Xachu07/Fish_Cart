const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();

(async function main() {
  try {
    await connectDB();
    const roles = ['admin', 'user', 'partner'];
    for (const role of roles) {
      const count = await User.countDocuments({ role });
      console.log(`${role}: ${count}`);
      const samples = await User.find({ role }).select('name email phone role isBlocked status areaOfService').limit(5).lean();
      if (samples.length) {
        console.log(`  Sample ${role}s:`);
        samples.forEach((s) => {
          console.log(`   - ${s.name || '(no name)'} | ${s.email} | phone:${s.phone || '-'} | blocked:${s.isBlocked} | status:${s.status || '-'}${s.areaOfService ? ' | area:' + s.areaOfService : ''}`);
        });
      }
    }
  } catch (err) {
    console.error('Error checking users:', err.message || err);
    process.exitCode = 1;
  } finally {
    try { await require('mongoose').connection.close(); } catch (_) {}
  }
})();

