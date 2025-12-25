require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
}).then(() => {
  console.log('✅ MongoDB Connected Successfully');
  console.log('Host:', mongoose.connection.host);
  console.log('Database:', mongoose.connection.name);
  process.exit(0);
}).catch((err) => {
  console.error('❌ MongoDB Connection Failed:');
  console.error('Error:', err.message);
  console.error('Full error:', err);
  process.exit(1);
});
