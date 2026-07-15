require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Plan = require('../models/Plan');

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // 1. Create Default Plans if none exist
    const planCount = await Plan.countDocuments();
    if (planCount === 0) {
      const defaultPlans = [
        {
          name: 'Free Trial',
          price: 0,
          maxUsers: 5,
          maxProjects: 3,
          features: ['Dashboard', 'Task Management', 'Basic Reporting'],
          isActive: true
        },
        {
          name: 'Basic',
          price: 29,
          maxUsers: 20,
          maxProjects: 10,
          features: ['All Trial features', 'File Sharing', 'Meeting Integration', 'Priority Support'],
          isActive: true
        },
        {
          name: 'Pro',
          price: 99,
          maxUsers: 100,
          maxProjects: 50,
          features: ['All Basic features', 'AI Performance Scoring', 'Advanced Analytics', 'Unlimited Files'],
          isActive: true
        }
      ];
      await Plan.insertMany(defaultPlans);
      console.log('Default plans seeded.');
    }

    // 2. Create Super Admin if not exists
    const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@cognifypm.com';
    const existingAdmin = await User.findOne({ email });

    if (!existingAdmin) {
      await User.create({
        fullName: process.env.SUPER_ADMIN_NAME || 'Super Admin',
        email,
        password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
        role: 'super_admin',
        isEmailVerified: true
      });
      console.log(`Super Admin created: ${email}`);
    } else {
      console.log('Super Admin already exists.');
    }

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
