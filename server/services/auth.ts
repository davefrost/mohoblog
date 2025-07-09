/* File: server/services/auth.ts */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../utils/db';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function register(email: string, password: string) {
  const hash = await bcrypt.hash(password, 12);
  const [user] = await db('users')
    .insert({ email, password_hash: hash })
    .returning(['id', 'email']);
  return user;
}

export async function login(email: string, password: string) {
  const user = await db('users').where({ email }).first();
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new Error('Invalid credentials');
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '2h' });
  return { token };
}
