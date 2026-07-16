/**
 * findOrphanedCompanies.js
 * 
 * One-time diagnostic script to find Company documents that have no associated User.
 * These orphans are typically caused by the registration bug where Company.create()
 * succeeded but User.create() failed, leaving behind a Company with no owner.
 *
 * Usage:
 *   node scripts/findOrphanedCompanies.js
 *
 * NOTE: This script REPORTS orphaned companies — it does NOT delete them.
 *       Review the output before taking any action.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('../models/Company');
const User = require('../models/User');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function findOrphans() {
  if (!MONGO_URI) {
    console.error('❌ MONGODB_URI / MONGO_URI not found in environment variables.');
    console.error('   Make sure .env is in the backend root directory.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✓ Connected.\n');

  // Find all companies that have NO user referencing them
  const orphanedCompanies = await Company.aggregate([
    {
      $lookup: {
        from: 'users',            // MongoDB collection name (lowercase plural)
        localField: '_id',
        foreignField: 'company',
        as: 'associatedUsers',
      },
    },
    {
      $match: {
        associatedUsers: { $size: 0 },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        location: 1,
        isActive: 1,
        createdAt: 1,
      },
    },
  ]);

  console.log('═══════════════════════════════════════════════');
  console.log(' ORPHANED COMPANIES REPORT');
  console.log('═══════════════════════════════════════════════\n');

  if (orphanedCompanies.length === 0) {
    console.log('✅ No orphaned companies found. All companies have at least one associated user.\n');
  } else {
    console.log(`⚠️  Found ${orphanedCompanies.length} orphaned company/companies:\n`);
    orphanedCompanies.forEach((company, index) => {
      console.log(`  ${index + 1}. ID:        ${company._id}`);
      console.log(`     Name:      ${company.name}`);
      console.log(`     Location:  ${company.location || 'N/A'}`);
      console.log(`     Active:    ${company.isActive}`);
      console.log(`     Created:   ${company.createdAt}`);
      console.log('');
    });

    console.log('─────────────────────────────────────────────');
    console.log('To delete these manually, run in mongo shell:');
    console.log('');
    const ids = orphanedCompanies.map((c) => `ObjectId("${c._id}")`).join(', ');
    console.log(`  db.companies.deleteMany({ _id: { $in: [${ids}] } })`);
    console.log('');
  }

  // Also show total counts for context
  const totalCompanies = await Company.countDocuments();
  const totalUsers = await User.countDocuments();
  console.log('─────────────────────────────────────────────');
  console.log(`Total companies in DB: ${totalCompanies}`);
  console.log(`Total users in DB:     ${totalUsers}`);
  console.log(`Orphaned companies:    ${orphanedCompanies.length}`);
  console.log('═══════════════════════════════════════════════\n');

  await mongoose.disconnect();
  console.log('✓ Disconnected from MongoDB.');
}

findOrphans().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
