import { User } from '../models/User';

export const seedDatabase = async (_force: boolean = false): Promise<void> => {
  const adminExists = await User.findOne({ email: 'admin@messsystem.com' });

  if (adminExists) {
    console.log('Admin account already exists. Leaving operational collections empty.');
    return;
  }

  await User.create({
    name: 'System Administrator',
    email: 'admin@messsystem.com',
    password: 'Password@123',
    role: 'admin',
    phone: '',
    isActive: true,
  });

  console.log('Created the initial admin account only. All operational collections remain empty.');
};

if (process.argv[1]?.includes('seed')) {
  import('dotenv/config').then(async () => {
    const { connectDB, disconnectDB } = await import('../config/db');
    try {
      await connectDB();
      await seedDatabase(true);
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('Seed execution failed:', err);
      process.exit(1);
    }
  });
}
