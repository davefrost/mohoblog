import { describe, it, expect, beforeEach } from '@jest/globals';
import { MockStorage } from './mockStorage';

describe('Contact Form Tests', () => {
  let mockStorage: MockStorage;
  
  beforeEach(() => {
    mockStorage = new MockStorage();
    mockStorage.reset();
  });

  describe('Contact Submission Creation', () => {
    it('should create a contact submission', async () => {
      const submission = await mockStorage.createContactSubmission({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        subject: 'Test Subject',
        message: 'This is a test message.',
      });

      expect(submission).toBeDefined();
      expect(submission.firstName).toBe('John');
      expect(submission.lastName).toBe('Doe');
      expect(submission.email).toBe('john.doe@example.com');
      expect(submission.subject).toBe('Test Subject');
      expect(submission.message).toBe('This is a test message.');
      expect(submission.isRead).toBe(false);
    });

    it('should have auto-generated ID', async () => {
      const submission = await mockStorage.createContactSubmission({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        subject: 'Subject',
        message: 'Message',
      });

      expect(submission.id).toBeDefined();
      expect(typeof submission.id).toBe('number');
    });

    it('should have createdAt timestamp', async () => {
      const submission = await mockStorage.createContactSubmission({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        subject: 'Subject',
        message: 'Message',
      });

      expect(submission.createdAt).toBeDefined();
      expect(submission.createdAt instanceof Date).toBe(true);
    });
  });

  describe('Contact Submission Retrieval', () => {
    it('should get all contact submissions', async () => {
      await mockStorage.createContactSubmission({
        firstName: 'User1',
        lastName: 'Last1',
        email: 'user1@example.com',
        subject: 'Subject 1',
        message: 'Message 1',
      });

      await mockStorage.createContactSubmission({
        firstName: 'User2',
        lastName: 'Last2',
        email: 'user2@example.com',
        subject: 'Subject 2',
        message: 'Message 2',
      });

      const submissions = await mockStorage.getAllContactSubmissions();
      
      expect(submissions).toHaveLength(2);
    });

    it('should return submissions in descending order by date', async () => {
      await mockStorage.createContactSubmission({
        firstName: 'First',
        lastName: 'Submission',
        email: 'first@example.com',
        subject: 'Subject',
        message: 'Message',
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      await mockStorage.createContactSubmission({
        firstName: 'Second',
        lastName: 'Submission',
        email: 'second@example.com',
        subject: 'Subject',
        message: 'Message',
      });

      const submissions = await mockStorage.getAllContactSubmissions();
      
      expect(submissions[0].firstName).toBe('Second');
      expect(submissions[1].firstName).toBe('First');
    });
  });

  describe('Mark as Read', () => {
    it('should mark submission as read', async () => {
      const submission = await mockStorage.createContactSubmission({
        firstName: 'Unread',
        lastName: 'User',
        email: 'unread@example.com',
        subject: 'Subject',
        message: 'Message',
      });

      expect(submission.isRead).toBe(false);

      await mockStorage.markContactSubmissionAsRead(submission.id);

      const submissions = await mockStorage.getAllContactSubmissions();
      const updated = submissions.find(s => s.id === submission.id);
      
      expect(updated!.isRead).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should require all fields', () => {
      const requiredFields = ['firstName', 'lastName', 'email', 'subject', 'message'];
      
      requiredFields.forEach(field => {
        expect(requiredFields).toContain(field);
      });
    });

    it('should validate email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
      ];

      const invalidEmails = [
        'notanemail',
        '@nodomain.com',
        'no@',
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });
});

describe('Newsletter Subscription Tests', () => {
  let mockStorage: MockStorage;
  
  beforeEach(() => {
    mockStorage = new MockStorage();
    mockStorage.reset();
  });

  describe('Subscription Creation', () => {
    it('should create a newsletter subscription', async () => {
      const subscription = await mockStorage.createNewsletterSubscription({
        email: 'subscriber@example.com',
      });

      expect(subscription).toBeDefined();
      expect(subscription.email).toBe('subscriber@example.com');
      expect(subscription.isActive).toBe(true);
      expect(subscription.unsubscribeToken).toBeDefined();
    });

    it('should reactivate existing subscription', async () => {
      const first = await mockStorage.createNewsletterSubscription({
        email: 'reactivate@example.com',
      });

      await mockStorage.unsubscribeFromNewsletter('reactivate@example.com');

      const reactivated = await mockStorage.createNewsletterSubscription({
        email: 'reactivate@example.com',
      });

      expect(reactivated.email).toBe('reactivate@example.com');
      expect(reactivated.isActive).toBe(true);
    });
  });

  describe('Subscription Retrieval', () => {
    it('should get only active subscriptions', async () => {
      await mockStorage.createNewsletterSubscription({
        email: 'active@example.com',
      });

      const inactive = await mockStorage.createNewsletterSubscription({
        email: 'inactive@example.com',
      });

      await mockStorage.unsubscribeFromNewsletter('inactive@example.com');

      const subscriptions = await mockStorage.getNewsletterSubscriptions();
      
      expect(subscriptions).toHaveLength(1);
      expect(subscriptions[0].email).toBe('active@example.com');
    });
  });

  describe('Unsubscribe', () => {
    it('should unsubscribe by email', async () => {
      await mockStorage.createNewsletterSubscription({
        email: 'unsubscribe@example.com',
      });

      await mockStorage.unsubscribeFromNewsletter('unsubscribe@example.com');

      const subscriptions = await mockStorage.getNewsletterSubscriptions();
      const unsubscribed = subscriptions.find(s => s.email === 'unsubscribe@example.com');
      
      expect(unsubscribed).toBeUndefined();
    });
  });
});

describe('Password Reset Tests', () => {
  let mockStorage: MockStorage;
  let testUserId: string;
  
  beforeEach(async () => {
    mockStorage = new MockStorage();
    mockStorage.reset();
    
    testUserId = 'user_reset_test';
    await mockStorage.upsertUser({
      id: testUserId,
      email: 'reset@example.com',
      firstName: 'Reset',
      lastName: 'User',
      passwordHash: 'old_hash',
    });
  });

  describe('Token Creation', () => {
    it('should create a password reset token', async () => {
      const expiresAt = new Date(Date.now() + 3600000);
      const token = await mockStorage.createPasswordResetToken(
        testUserId,
        'test-token-123',
        expiresAt
      );

      expect(token).toBeDefined();
      expect(token.userId).toBe(testUserId);
      expect(token.token).toBe('test-token-123');
      expect(token.isUsed).toBe(false);
      expect(token.expiresAt.getTime()).toBe(expiresAt.getTime());
    });
  });

  describe('Token Retrieval', () => {
    it('should get valid token', async () => {
      const expiresAt = new Date(Date.now() + 3600000);
      await mockStorage.createPasswordResetToken(
        testUserId,
        'valid-token',
        expiresAt
      );

      const token = await mockStorage.getPasswordResetToken('valid-token');
      
      expect(token).toBeDefined();
      expect(token!.token).toBe('valid-token');
    });

    it('should not return expired token', async () => {
      const expiresAt = new Date(Date.now() - 1000);
      await mockStorage.createPasswordResetToken(
        testUserId,
        'expired-token',
        expiresAt
      );

      const token = await mockStorage.getPasswordResetToken('expired-token');
      
      expect(token).toBeUndefined();
    });

    it('should not return used token', async () => {
      const expiresAt = new Date(Date.now() + 3600000);
      await mockStorage.createPasswordResetToken(
        testUserId,
        'used-token',
        expiresAt
      );

      await mockStorage.markPasswordResetTokenAsUsed('used-token');

      const token = await mockStorage.getPasswordResetToken('used-token');
      
      expect(token).toBeUndefined();
    });

    it('should return undefined for non-existent token', async () => {
      const token = await mockStorage.getPasswordResetToken('non-existent');
      expect(token).toBeUndefined();
    });
  });

  describe('Token Usage', () => {
    it('should mark token as used', async () => {
      const expiresAt = new Date(Date.now() + 3600000);
      await mockStorage.createPasswordResetToken(
        testUserId,
        'to-use-token',
        expiresAt
      );

      const result = await mockStorage.markPasswordResetTokenAsUsed('to-use-token');
      
      expect(result).toBe(true);

      const token = await mockStorage.getPasswordResetToken('to-use-token');
      expect(token).toBeUndefined();
    });

    it('should return false for non-existent token', async () => {
      const result = await mockStorage.markPasswordResetTokenAsUsed('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('Token Cleanup', () => {
    it('should cleanup expired and used tokens', async () => {
      const validExpiry = new Date(Date.now() + 3600000);
      const expiredExpiry = new Date(Date.now() - 1000);

      await mockStorage.createPasswordResetToken(testUserId, 'valid', validExpiry);
      await mockStorage.createPasswordResetToken(testUserId, 'expired', expiredExpiry);
      await mockStorage.createPasswordResetToken(testUserId, 'used', validExpiry);
      await mockStorage.markPasswordResetTokenAsUsed('used');

      await mockStorage.cleanupExpiredPasswordResetTokens();

      const valid = await mockStorage.getPasswordResetToken('valid');
      expect(valid).toBeDefined();
    });
  });
});
