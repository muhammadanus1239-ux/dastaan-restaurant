const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const Reservation = require('./models/Reservation');
const Order = require('./models/Order');

// 1. Initial Users (Passwords must be hashed with bcryptjs as per A2 Q5)
const seedUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  const customerPassword = await bcrypt.hash('Customer123', salt);
  const managerPassword = await bcrypt.hash('Manager123', salt);

  return [
    {
      name: 'Ahmed Khan',
      email: 'customer@dastaan.com',
      password: customerPassword,
      role: 'customer'
    },
    {
      name: 'Chef Tariq',
      email: 'manager@dastaan.com',
      password: managerPassword,
      role: 'manager'
    }
  ];
};

// 2. 15+ Menu Items across 4 categories (Starters, Mains, Desserts, Drinks)
const initialMenuItems = require('./data/initialMenuItems');
// 54 authentic dishes for seeding
const menuItemsData = initialMenuItems;

// 3. Tables Data (6 tables covering 2, 4, 6, and 8 seaters)
const tablesData = [
  { number: 1, seats: 2, isActive: true },
  { number: 2, seats: 2, isActive: true },
  { number: 3, seats: 4, isActive: true },
  { number: 4, seats: 4, isActive: true },
  { number: 5, seats: 6, isActive: true },
  { number: 6, seats: 8, isActive: true }
];

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is missing in environment variables (.env). Please provide your MongoDB connection string.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    })
      .then((conn) => {
        console.log(`MongoDB connected successfully: ${conn.connection.host}`);
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error.message);
        throw error;
      });

    // Clear existing collections
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    await Table.deleteMany({});
    await Reservation.deleteMany({});
    await Order.deleteMany({});

    // Seed Users
    const users = await seedUsers();
    const createdUsers = await User.insertMany(users);
    console.log(`Seeded ${createdUsers.length} users (1 customer, 1 manager).`);

    // Seed Menu Items
    const createdMenuItems = await MenuItem.insertMany(menuItemsData);
    console.log(`Seeded ${createdMenuItems.length} menu items across 4 categories.`);

    // Seed Tables
    const createdTables = await Table.insertMany(tablesData);
    console.log(`Seeded ${createdTables.length} tables.`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedUsers, menuItemsData, tablesData };
