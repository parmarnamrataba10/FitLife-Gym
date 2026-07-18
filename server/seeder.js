const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Member = require('./models/Member');
const Trainer = require('./models/Trainer');
const MembershipPlan = require('./models/MembershipPlan');

const seed = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected for seeding...');

    await User.deleteMany({});
    await Member.deleteMany({});
    await Trainer.deleteMany({});
    await MembershipPlan.deleteMany({});

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@gym.com',
      password: 'admin123',
      role: 'admin',
      phone: '9876543210'
    });
    console.log(`Admin created: admin@gym.com / admin123`);

    const trainerUser = await User.create({
      name: 'Trainer Raj',
      email: 'trainer@gym.com',
      password: 'trainer123',
      role: 'trainer',
      phone: '9876543211'
    });

    await Trainer.create({
      user: trainerUser._id,
      specialization: 'Strength Training',
      experience: 5,
      salary: 35000,
      shiftTiming: { start: '06:00', end: '14:00' },
      certifications: 'Certified Personal Trainer (CPT)',
      bio: 'Expert in strength and conditioning'
    });
    console.log(`Trainer created: trainer@gym.com / trainer123`);

    const memberUser = await User.create({
      name: 'Member John',
      email: 'member@gym.com',
      password: 'member123',
      role: 'member',
      phone: '9876543212'
    });

    await Member.create({
      user: memberUser._id,
      age: 28,
      gender: 'male',
      height: 175,
      weight: 75,
      address: '123 Main St, City',
      emergencyContact: { name: 'Jane', phone: '9876543213', relation: 'Spouse' },
      joiningDate: new Date(),
      status: 'active'
    });
    console.log(`Member created: member@gym.com / member123`);

    const plans = await MembershipPlan.insertMany([
      {
        name: 'Basic',
        price: 999,
        duration: 1,
        durationType: 'months',
        features: ['Gym access', 'Cardio equipment', 'Locker facility'],
        description: 'Essential gym access',
        freezeDays: 3,
        discount: 0
      },
      {
        name: 'Standard',
        price: 1999,
        duration: 3,
        durationType: 'months',
        features: ['Gym access', 'Cardio equipment', 'Locker facility', 'Group classes', '1 PT session/week'],
        description: 'Most popular plan',
        freezeDays: 7,
        discount: 10
      },
      {
        name: 'Premium',
        price: 4999,
        duration: 12,
        durationType: 'months',
        features: ['Gym access', 'Cardio equipment', 'Locker facility', 'Group classes', 'Unlimited PT sessions', 'Diet consultation', 'Steam room'],
        description: 'Ultimate fitness experience',
        freezeDays: 15,
        discount: 20
      }
    ]);
    console.log(`Plans created: ${plans.map(p => p.name).join(', ')}`);

    console.log('\n--- Login Credentials ---');
    console.log('Admin:   admin@gym.com / admin123');
    console.log('Trainer: trainer@gym.com / trainer123');
    console.log('Member:  member@gym.com / member123');
    console.log('------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seed();
