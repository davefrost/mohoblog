# Adventures on Wheels - Motorhome Blog

A full-stack blog application built for motorhome enthusiasts to share their travel experiences, mechanical insights, and adventures on the road.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login with Replit Auth
- **Blog Management**: Create, edit, and delete blog posts
- **Image Uploads**: Featured images for posts with secure file handling
- **Contact System**: Contact form with email notifications
- **Newsletter**: Subscription system with unsubscribe functionality

### Advanced Features
- **Categories**: Organize posts by Adventures, Mechanical Issues, and Dog stories
- **Analytics**: Track page views, post engagement, and user behavior
- **Comments**: Threaded comment system with approval workflow
- **Tags**: Flexible tagging system for better content organization
- **Admin Dashboard**: Comprehensive management interface
- **SEO Optimized**: SEO-friendly URLs and meta tags

### Database Features
- **PostgreSQL**: Robust database with advanced indexing
- **Password Hashing**: Secure bcrypt implementation
- **Analytics Tracking**: Detailed event tracking and reporting
- **Performance Optimization**: Automated database indexing
- **Data Integrity**: Comprehensive validation and error handling

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express, Drizzle ORM
- **Database**: PostgreSQL with Neon serverless
- **Authentication**: Replit Auth (OpenID Connect)
- **Build Tool**: Vite for fast development
- **File Uploads**: Multer with local storage
- **Email**: Nodemailer for notifications

## 📋 Setup Instructions

### Prerequisites
- Node.js 20+
- PostgreSQL database (automatically provisioned)
- SMTP credentials for email (optional)

### Quick Start

1. **Database Setup**
   ```bash
   npm run db:push
   npm run create-indexes
   ```

2. **Create Admin User**
   ```bash
   # First, log in through the web interface
   # Then run this command with your email
   node scripts/make-admin.js your-email@example.com
   ```

3. **Add Sample Data (Optional)**
   ```bash
   node scripts/sample-data.js
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `node scripts/make-admin.js <email>` - Make a user admin
- `node scripts/create-indexes.js` - Create performance indexes
- `node scripts/sample-data.js` - Add sample blog posts

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Backend Express application
│   ├── services/          # Business logic services
│   ├── utils/             # Server utilities
│   ├── routes.ts          # API route definitions
│   └── storage.ts         # Database operations
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema definitions
└── scripts/               # Utility scripts
```

## 🔑 Environment Variables

Required environment variables are automatically configured:
- `DATABASE_URL` - PostgreSQL connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - Database credentials

Optional environment variables for email:
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port  
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `ADMIN_EMAIL` - Admin email for contact notifications

## 👤 User Management

### Making Users Admin
After a user logs in for the first time:
```bash
node scripts/make-admin.js user@example.com
```

### Admin Features
Admin users can:
- Create, edit, and delete blog posts
- Manage user roles
- View analytics dashboard
- Approve/moderate comments
- Access contact form submissions
- Manage newsletter subscriptions

## 📊 Analytics & Performance

The blog includes comprehensive analytics tracking:
- Page views and post engagement
- User session tracking
- Popular content identification
- Traffic source analysis
- Performance metrics

Database performance is optimized with:
- Automated indexing for common queries
- Connection pooling
- Query optimization
- Regular maintenance utilities

## 🎨 Customization

### Categories
The blog supports three main categories:
- **Adventures**: Travel stories and experiences
- **Mechanical**: RV maintenance and repairs
- **Dog**: Pet-related travel stories

### Styling
- Tailwind CSS for responsive design
- Radix UI for accessible components
- Custom color scheme for motorhome theme
- Dark/light mode support

### Content Management
- Rich text editor with markdown support
- Image upload and management
- SEO-friendly URL slugs
- Draft/publish workflow

## 🚚 Deployment

The application is ready for deployment on Replit:
1. All dependencies are properly configured
2. Database is automatically provisioned
3. Environment variables are set up
4. Build process is optimized

## 📝 Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Write meaningful commit messages
4. Test changes thoroughly
5. Update documentation as needed

## 📄 License

MIT License - feel free to use this project as a starting point for your own blog!

---

Built with ❤️ for the motorhome community