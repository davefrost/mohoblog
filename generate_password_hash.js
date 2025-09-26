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
  const password = 'sum2025merA!'; // <-- Change this
  const hash = await hashPassword(password);
  console.log('Password:', password);
  console.log('Hash to store in DB:', hash);
  console.log('\nSQL command to update your password:');
  console.log(`UPDATE users SET "passwordHash" = '${hash}' WHERE email = 'dave@davefrost.co.uk';`);
}

generateHash().catch(console.error);