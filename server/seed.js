require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@lms.com',
    password: 'Admin@123',
    role: 'admin',
  },
  {
    name: 'Instructor Demo',
    email: 'instructor@lms.com',
    password: 'Instructor@123',
    role: 'instructor',
  },
  {
    name: 'Student Demo',
    email: 'student@lms.com',
    password: 'Student@123',
    role: 'student',
  },
];

const seed = async () => {
  try {
    await connectDB();

    for (const userData of seedUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (exists) {
        console.log(`⚠️  User already exists: ${userData.email} — skipping`);
        continue;
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      await User.create({ ...userData, password: hashedPassword });
      console.log(`✅ Created user: ${userData.email} (role: ${userData.role})`);
    }

    console.log('\n🎉 Seeding complete! Use these credentials to log in:\n');
    console.log('  Admin     → admin@lms.com       / Admin@123');
    console.log('  Instructor→ instructor@lms.com  / Instructor@123');
    console.log('  Student   → student@lms.com     / Student@123\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
