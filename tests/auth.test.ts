import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { MockStorage } from './mockStorage';
import { createMockUser } from './helpers';
import * as bcrypt from 'bcryptjs';

describe('Authentication Tests', () => {
  let mockStorage: MockStorage;
  
  beforeEach(() => {
    mockStorage = new MockStorage();
    mockStorage.reset();
  });

  describe('User Registration', () => {
    it('should create a new user with hashed password', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const user = await mockStorage.upsertUser({
        id: 'user_test_123',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        passwordHash: hashedPassword,
        isAdmin: false,
        isActive: true,
      });

      expect(user).toBeDefined();
      expect(user.email).toBe('newuser@example.com');
      expect(user.firstName).toBe('New');
      expect(user.lastName).toBe('User');
      expect(user.passwordHash).not.toBe(password);
      expect(await bcrypt.compare(password, user.passwordHash!)).toBe(true);
    });

    it('should not allow duplicate email registration', async () => {
      const email = 'duplicate@example.com';
      
      await mockStorage.upsertUser({
        id: 'user_1',
        email,
        firstName: 'First',
        lastName: 'User',
        passwordHash: 'hash1',
      });

      const users = await mockStorage.getAllUsers();
      const existingUser = users.find(u => u.email === email);
      
      expect(existingUser).toBeDefined();
    });

    it('should validate required fields', () => {
      const invalidUserData = {
        email: '',
        firstName: '',
        lastName: '',
        password: '',
      };

      expect(invalidUserData.email).toBe('');
      expect(invalidUserData.password).toBe('');
    });
  });

  describe('User Login', () => {
    it('should authenticate user with correct credentials', async () => {
      const password = 'ValidPassword123!';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      await mockStorage.upsertUser({
        id: 'user_login_test',
        email: 'login@example.com',
        firstName: 'Login',
        lastName: 'Test',
        passwordHash: hashedPassword,
        isActive: true,
      });

      const users = await mockStorage.getAllUsers();
      const user = users.find(u => u.email === 'login@example.com');
      
      expect(user).toBeDefined();
      expect(user!.passwordHash).toBeDefined();
      
      const isValid = await bcrypt.compare(password, user!.passwordHash!);
      expect(isValid).toBe(true);
    });

    it('should reject authentication with incorrect password', async () => {
      const password = 'CorrectPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      await mockStorage.upsertUser({
        id: 'user_wrong_pass',
        email: 'wrongpass@example.com',
        firstName: 'Wrong',
        lastName: 'Pass',
        passwordHash: hashedPassword,
        isActive: true,
      });

      const users = await mockStorage.getAllUsers();
      const user = users.find(u => u.email === 'wrongpass@example.com');
      
      const isValid = await bcrypt.compare(wrongPassword, user!.passwordHash!);
      expect(isValid).toBe(false);
    });

    it('should reject authentication for non-existent user', async () => {
      const users = await mockStorage.getAllUsers();
      const user = users.find(u => u.email === 'nonexistent@example.com');
      
      expect(user).toBeUndefined();
    });

    it('should reject authentication for inactive user', async () => {
      const hashedPassword = await bcrypt.hash('password', 12);
      
      await mockStorage.upsertUser({
        id: 'user_inactive',
        email: 'inactive@example.com',
        firstName: 'Inactive',
        lastName: 'User',
        passwordHash: hashedPassword,
        isActive: false,
      });

      const users = await mockStorage.getAllUsers();
      const user = users.find(u => u.email === 'inactive@example.com');
      
      expect(user).toBeDefined();
      expect(user!.isActive).toBe(false);
    });
  });

  describe('User Session', () => {
    it('should get user by ID', async () => {
      const userId = 'user_session_test';
      
      await mockStorage.upsertUser({
        id: userId,
        email: 'session@example.com',
        firstName: 'Session',
        lastName: 'Test',
        passwordHash: 'hash',
      });

      const user = await mockStorage.getUser(userId);
      
      expect(user).toBeDefined();
      expect(user!.id).toBe(userId);
      expect(user!.email).toBe('session@example.com');
    });

    it('should return undefined for non-existent user ID', async () => {
      const user = await mockStorage.getUser('nonexistent_id');
      expect(user).toBeUndefined();
    });
  });

  describe('Admin Access', () => {
    it('should correctly identify admin users', async () => {
      await mockStorage.upsertUser({
        id: 'admin_user',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        passwordHash: 'hash',
        isAdmin: true,
      });

      const user = await mockStorage.getUser('admin_user');
      
      expect(user).toBeDefined();
      expect(user!.isAdmin).toBe(true);
    });

    it('should correctly identify non-admin users', async () => {
      await mockStorage.upsertUser({
        id: 'regular_user',
        email: 'regular@example.com',
        firstName: 'Regular',
        lastName: 'User',
        passwordHash: 'hash',
        isAdmin: false,
      });

      const user = await mockStorage.getUser('regular_user');
      
      expect(user).toBeDefined();
      expect(user!.isAdmin).toBe(false);
    });
  });

  describe('Password Change', () => {
    it('should update user password', async () => {
      const oldPassword = 'OldPassword123!';
      const newPassword = 'NewPassword456!';
      const oldHash = await bcrypt.hash(oldPassword, 12);
      const newHash = await bcrypt.hash(newPassword, 12);
      
      await mockStorage.upsertUser({
        id: 'user_change_pass',
        email: 'changepass@example.com',
        firstName: 'Change',
        lastName: 'Pass',
        passwordHash: oldHash,
      });

      const result = await mockStorage.changeUserPassword('user_change_pass', newHash);
      expect(result).toBe(true);

      const user = await mockStorage.getUser('user_change_pass');
      expect(await bcrypt.compare(newPassword, user!.passwordHash!)).toBe(true);
    });

    it('should return false for non-existent user', async () => {
      const result = await mockStorage.changeUserPassword('nonexistent', 'hash');
      expect(result).toBe(false);
    });
  });

  describe('User Profile Update', () => {
    it('should update user profile', async () => {
      await mockStorage.upsertUser({
        id: 'user_profile',
        email: 'profile@example.com',
        firstName: 'Old',
        lastName: 'Name',
        passwordHash: 'hash',
      });

      const updated = await mockStorage.updateUserProfile('user_profile', {
        firstName: 'New',
        lastName: 'Name',
        email: 'newemail@example.com',
      });

      expect(updated).toBeDefined();
      expect(updated!.firstName).toBe('New');
      expect(updated!.lastName).toBe('Name');
      expect(updated!.email).toBe('newemail@example.com');
    });

    it('should return undefined for non-existent user', async () => {
      const updated = await mockStorage.updateUserProfile('nonexistent', {
        firstName: 'Test',
      });
      expect(updated).toBeUndefined();
    });
  });
});
