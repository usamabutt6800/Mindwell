const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Load env vars
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function run() {
  try {
    const email = await question('Enter Admin Email: ');
    const password = await question('Enter Admin Password: ');

    if (!email || !password) {
      console.log('⚠️  Email and password are required.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Define User schema inline
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      createdAt: { type: Date, default: Date.now }
    });
    const User = mongoose.model('User', userSchema);

    // Check if user exists to prevent duplicates or update existing
    const existingUser = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 12);

    if (existingUser) {
      existingUser.password = hashedPassword;
      existingUser.role = 'admin';
      await existingUser.save();
      console.log('✅ Admin user updated successfully!');
    } else {
      await User.create({
        name: 'Admin',
        email,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Admin user created successfully!');
    }

    console.log(`📧 Email: ${email}`);
    console.log(`👤 Role: admin`);
    
    rl.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    rl.close();
    process.exit(1);
  }
}

run();