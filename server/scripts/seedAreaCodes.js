/**
 * One-time script: set areaCode on existing Area documents by name.
 * Run from server folder: node scripts/seedAreaCodes.js
 * Order IDs will then follow # + 3-letter code + 4 digits (e.g. #CGN0001).
 */
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Area = require('../models/Area');

const AREA_NAME_TO_CODE = {
  Adoor: 'ADO',
  Azheekkal: 'AZH',
  Chavara: 'CHV',
  Chengannur: 'CGN',
  Haripad: 'HPD',
  Karunagapally: 'KNP',
  Kayamkulam: 'KYM',
  Mavelikkara: 'MVL',
  Oachira: 'OCR',
  Pandalam: 'PND',
  Thiruvalla: 'TVL',
};

async function main() {
  try {
    await connectDB();
    const areas = await Area.find({}).lean();
    let updated = 0;
    for (const a of areas) {
      const nameKey = Object.keys(AREA_NAME_TO_CODE).find((k) => k.toLowerCase() === (a.name || '').trim().toLowerCase());
      const code = nameKey ? AREA_NAME_TO_CODE[nameKey] : null;
      const existingCode = (a.areaCode && String(a.areaCode).trim()) ? String(a.areaCode).trim().toUpperCase().slice(0, 3) : '';
      if (code && existingCode.length < 3) {
        await Area.updateOne({ _id: a._id }, { $set: { areaCode: code.trim().toUpperCase().slice(0, 3) } });
        console.log(`Updated area "${a.name}" → areaCode: ${code}`);
        updated++;
      }
    }
    console.log(`Done. Updated ${updated} area(s).`);
  } catch (err) {
    console.error('Seed area codes failed:', err);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.connection.close();
    } catch (_) {}
  }
}

main();
