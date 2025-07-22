/* File: server/routes.ts */
import express from 'express';
import { register, login } from './services/auth';
import { body, validationResult } from 'express-validator';
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendContactEmail } from "./services/email";
import { handleFileUpload } from "./services/upload";
import { trackEvent, trackPostView, trackContactForm, trackNewsletterSubscription } from "./services/analytics";
import { insertPostSchema, insertContactSubmissionSchema, insertNewsletterSubscriptionSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import { setupAuth } from "./replitAuth.ts";
import { Router } from "express";
import { isAuthenticated } from "./replitAuth.ts"


const router = Router();



// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
router.post(
  '/auth/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await register(req.body.email, req.body.password);
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Registration failed' });
    }
  }
);

router.post('/auth/login', async (req, res) => {
  try {
    const { token } = await login(req.body.email, req.body.password);
    res.json({ token });
  } catch (err: any) {
    res.status(401).json({ error: err?.message || 'Login failed' });
  }
});

  // Blog post routes
  app.get('/api/posts', async (req, res) => {
    try {
      const category = req.query.category as string;
      const posts = category 
        ? await storage.getPostsByCategory(category)
        : await storage.getAllPosts();
      
      // Only return published posts for non-authenticated users
      const filteredPosts = posts.filter(post => post.isPublished);
      res.json(filteredPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get('/api/posts/admin', async(req, res) => {
    try {
      const currentUser = await storage.getUser((req.user as any)?.id || (req.user as any)?.claims?.sub);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts for admin:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get('/api/posts/:id', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Increment view count and track analytics
      await storage.incrementPostViews(postId);
      await trackPostView(req, postId);
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.get('/api/posts/slug/:slug', async (req, res) => {
    try {
      const post = await storage.getPostBySlug(req.params.slug);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Increment view count and track analytics
      await storage.incrementPostViews(post.id);
      await trackPostView(req, post.id);
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.post('/api/posts', async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const currentUser = await storage.getUser(userId);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const postData = insertPostSchema.parse({
        ...req.body,
        authorId: userId,
      });

      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.patch('/api/posts/:id', async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user?.id || req.user?.claims?.sub);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const postId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedPost = await storage.updatePost(postId, updates);
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete('/api/posts/:id', async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const postId = parseInt(req.params.id);
      const deleted = await storage.deletePost(postId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // File upload route
  app.post('/api/upload', upload.single('image'), async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const imageUrl = await handleFileUpload(req.file);
      res.json({ url: imageUrl });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Contact form route
  app.post('/api/contact', async (req, res) => {
    try {
      const contactData = insertContactSubmissionSchema.parse(req.body);
      
      // Save to database
      const submission = await storage.createContactSubmission(contactData);
      
      // Send email notification
      await sendContactEmail(contactData);
      
      // Track analytics
      await trackContactForm(req);
      
      res.status(201).json({ message: "Contact form submitted successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      console.error("Error processing contact form:", error);
      res.status(500).json({ message: "Failed to process contact form" });
    }
  });

  // Newsletter subscription route
  app.post('/api/newsletter', async (req, res) => {
    try {
      const subscriptionData = insertNewsletterSubscriptionSchema.parse(req.body);
      
      const subscription = await storage.createNewsletterSubscription(subscriptionData);
      
      // Track analytics
      await trackNewsletterSubscription(req);
      
      res.status(201).json({ message: "Successfully subscribed to newsletter" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email", errors: error.errors });
      }
      console.error("Error processing newsletter subscription:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  // Contact submissions management (admin only)
  app.get('/api/contact-submissions', async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const submissions = await storage.getAllContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ message: "Failed to fetch contact submissions" });
    }
  });

  app.patch('/api/contact-submissions/:id/read', async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const submissionId = parseInt(req.params.id);
      await storage.markContactSubmissionAsRead(submissionId);
      
      res.json({ message: "Contact submission marked as read" });
    } catch (error) {
      console.error("Error marking contact submission as read:", error);
      res.status(500).json({ message: "Failed to mark contact submission as read" });
    }
  });

  // Analytics dashboard route (admin only)
  app.get('/api/analytics/dashboard', async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const dashboard = await storage.getDashboardStats();
      res.json(dashboard);
    } catch (error) {
      console.error("Error fetching analytics dashboard:", error);
      res.status(500).json({ message: "Failed to fetch analytics dashboard" });
    }
  });

  // Database maintenance routes (admin only)
  app.post('/api/admin/database/indexes',  async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { createPerformanceIndexes } = await import('./utils/database');
      const results = await createPerformanceIndexes();
      res.json({ message: "Database indexes created", results });
    } catch (error) {
      console.error("Error creating database indexes:", error);
      res.status(500).json({ message: "Failed to create database indexes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
