/* File: server/services/auth.ts */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';
import { nanoid } from 'nanoid';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export async function register(email: string, password: string) {
  const hash = await bcrypt.hash(password, 12);
  const userId = nanoid();
  
  const user = await storage.upsertUser({
    id: userId,
    email,
    passwordHash: hash,
    isAdmin: false,
    isActive: true
  });
  
  return { id: user.id, email: user.email };
}

export async function login(email: string, password: string) {
  // For now, we'll handle this through Replit Auth
  // This is a placeholder for future local auth implementation
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '2h' });
  return { token };
}
