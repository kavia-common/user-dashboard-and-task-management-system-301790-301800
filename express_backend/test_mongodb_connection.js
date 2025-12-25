#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');

console.log('='.repeat(60));
console.log('MongoDB Atlas Connection Diagnostic');
console.log('='.repeat(60));

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('❌ MONGO_URI is not set in .env file');
  process.exit(1);
}

console.log('\n✓ MONGO_URI found in environment');
console.log('✓ Connection string format:', mongoURI.substring(0, 25) + '...');

console.log('\nAttempting to connect to MongoDB Atlas...');
console.log('Timeout: 10 seconds');

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then((conn) => {
  console.log('\n' + '='.repeat(60));
  console.log('✅ SUCCESS: MongoDB Connection Established');
  console.log('='.repeat(60));
  console.log('Host:', conn.connection.host);
  console.log('Database:', conn.connection.name);
  console.log('Ready State:', conn.connection.readyState);
  console.log('Connection ID:', conn.connection.id);
  
  // Test a simple operation
  console.log('\nTesting database operation...');
  return mongoose.connection.db.admin().ping();
})
.then(() => {
  console.log('✅ Database ping successful');
  console.log('\n' + '='.repeat(60));
  console.log('CONNECTION TEST PASSED');
  console.log('='.repeat(60));
  process.exit(0);
})
.catch((error) => {
  console.log('\n' + '='.repeat(60));
  console.error('❌ CONNECTION FAILED');
  console.log('='.repeat(60));
  console.error('\nError Type:', error.name);
  console.error('Error Message:', error.message);
  
  if (error.message.includes('querySrv ENOTFOUND') || error.message.includes('ENOTFOUND')) {
    console.error('\n⚠️  DNS Resolution Error:');
    console.error('   - The MongoDB Atlas cluster hostname cannot be resolved');
    console.error('   - Check your internet connection');
    console.error('   - Verify the cluster hostname in MONGO_URI is correct');
  }
  
  if (error.message.includes('Could not connect to any servers') || error.message.includes('ECONNREFUSED')) {
    console.error('\n⚠️  Connection Refused:');
    console.error('   - MongoDB Atlas may be blocking this IP address');
    console.error('   - Action Required: Add this server IP to MongoDB Atlas IP Whitelist');
    console.error('   - Or temporarily allow all IPs: 0.0.0.0/0');
  }
  
  if (error.message.includes('authentication') || error.message.includes('auth')) {
    console.error('\n⚠️  Authentication Error:');
    console.error('   - Username or password in MONGO_URI is incorrect');
    console.error('   - Verify credentials in MongoDB Atlas');
  }
  
  if (error.message.includes('timeout') || error.message.includes('timed out')) {
    console.error('\n⚠️  Connection Timeout:');
    console.error('   - Server cannot reach MongoDB Atlas');
    console.error('   - Check firewall rules');
    console.error('   - Verify MongoDB Atlas IP whitelist includes this server');
  }
  
  console.error('\nFull Error Stack:');
  console.error(error.stack);
  
  console.log('\n' + '='.repeat(60));
  console.log('DIAGNOSTIC COMPLETE - CONNECTION FAILED');
  console.log('='.repeat(60));
  
  process.exit(1);
});
