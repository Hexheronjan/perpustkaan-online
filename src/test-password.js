// test-password.js
// Jalankan: node test-password.js

const bcrypt = require('bcryptjs');

async function testPassword() {
  const plainPassword = 'staf123';
  
  // Hash dari database yang Anda update
  const hashFromDB = '$2a$10$N9qo8uLOickgx2ZMRZoMye1J5YvqhCYe8GH0.QqXdwVvYlPL4l.7i';
  
  console.log('🔐 Testing Password Verification\n');
  console.log('Plain Password:', plainPassword);
  console.log('Hash from DB:', hashFromDB);
  console.log('Hash Length:', hashFromDB.length);
  console.log('---');
  
  // Test 1: Generate fresh hash
  console.log('\n1️⃣ Generating FRESH hash for "staf123":');
  const freshHash = await bcrypt.hash(plainPassword, 10);
  console.log('Fresh Hash:', freshHash);
  
  // Test 2: Verify with hash from DB
  console.log('\n2️⃣ Verifying "staf123" with hash from DB:');
  const isValidDB = await bcrypt.compare(plainPassword, hashFromDB);
  console.log('Result:', isValidDB ? '✅ VALID' : '❌ INVALID');
  
  // Test 3: Verify with fresh hash
  console.log('\n3️⃣ Verifying "staf123" with fresh hash:');
  const isValidFresh = await bcrypt.compare(plainPassword, freshHash);
  console.log('Result:', isValidFresh ? '✅ VALID' : '❌ INVALID');
  
  // Test 4: Generate hash for all passwords
  console.log('\n4️⃣ SQL Script dengan Hash Baru:\n');
  const passwords = ['admin123', 'staf123', 'member123', 'visitor123'];
  const users = ['admin', 'staf1', 'member1', 'visitor1'];
  
  for (let i = 0; i < passwords.length; i++) {
    const hash = await bcrypt.hash(passwords[i], 10);
    console.log(`-- Password: ${passwords[i]}`);
    console.log(`UPDATE users SET password = '${hash}' WHERE username = '${users[i]}';`);
    console.log();
  }
  
  console.log('-- Verifikasi');
  console.log('SELECT id, username, email, LEFT(password, 30) as password_hash FROM users;');
}

testPassword().catch(console.error);