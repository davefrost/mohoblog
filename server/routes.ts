import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { sendContactEmail } from "./services/email";
import { handleFileUpload } from "./services/upload";
import { trackEvent, trackPostView, trackContactForm, trackNewsletterSubscription } from "./services/analytics";
import { insertPostSchema, insertContactSubmissionSchema, insertNewsletterSubscriptionSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";

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
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User management routes
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = req.params.id;
      const updates = req.body;
      
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
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

  app.get('/api/posts/admin', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
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

  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const postData = insertPostSchema.parse({
        ...req.body,
        authorId: req.user.claims.sub,
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

  app.patch('/api/posts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
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

  app.delete('/api/posts/:id', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/upload', isAuthenticated, upload.single('image'), async (req: any, res) => {
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
  app.get('/api/contact-submissions', isAuthenticated, async (req: any, res) => {
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

  app.patch('/api/contact-submissions/:id/read', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/analytics/dashboard', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/admin/database/indexes', isAuthenticated, async (req: any, res) => {
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
