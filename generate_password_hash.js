import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

// Replace 'your_new_password' with the password you want to use
async function generateHash() {
  const password = 'your_new_password'; // <-- Change this
  const hash = await hashPassword(password);
  console.log('Password:', password);
  console.log('Hash to store in DB:', hash);
  console.log('\nSQL command to update your password:');
  console.log(`UPDATE users SET "passwordHash" = '${hash}' WHERE email = 'your_email@example.com';`);
}

generateHash().catch(console.error);