import { Request } from 'express';
import { storage } from '../storage';
import type { InsertAnalytics } from '@shared/schema';

/**
 * Track analytics event
 */
export async function trackEvent(
  req: Request,
  event: string,
  entityType?: string,
  entityId?: string,
  metadata?: any
) {
  try {
    const userId = (req as any).user?.claims?.sub || null;
    const sessionId = req.sessionID || null;
    const ipAddress = req.ip || req.connection.remoteAddress || null;
    const userAgent = req.get('User-Agent') || null;
    const referrer = req.get('Referer') || null;

    const analyticsData: InsertAnalytics = {
      event,
      entityType: entityType || null,
      entityId: entityId || null,
      userId,
      sessionId,
      ipAddress,
      userAgent,
      referrer,
      metadata: metadata || null,
    };

    await storage.trackEvent(analyticsData);
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    // Don't throw error to avoid breaking main functionality
  }
}

/**
 * Track page view
 */
export async function trackPageView(req: Request, page: string) {
  await trackEvent(req, 'page_view', 'page', page);
}

/**
 * Track post view
 */
export async function trackPostView(req: Request, postId: number) {
  await trackEvent(req, 'post_view', 'post', postId.toString());
}

/**
 * Track contact form submission
 */
export async function trackContactForm(req: Request) {
  await trackEvent(req, 'contact_form', 'contact');
}

/**
 * Track newsletter subscription
 */
export async function trackNewsletterSubscription(req: Request) {
  await trackEvent(req, 'newsletter_subscription', 'newsletter');
}

/**
 * Track search
 */
export async function trackSearch(req: Request, query: string, results: number) {
  await trackEvent(req, 'search', 'search', undefined, { query, results });
}

/**
 * Track user login
 */
export async function trackUserLogin(req: Request, userId: string) {
  await trackEvent(req, 'user_login', 'user', userId);
}

/**
 * Get analytics dashboard data
 */
export async function getAnalyticsDashboard(days: number = 30) {
  const stats = await storage.getDashboardStats();
  
  // Get popular events
  const popularEvents = await storage.getAnalyticsByEvent('post_view', days);
  
  // Get top referrers
  const topReferrers = popularEvents
    .filter(event => event.referrer)
    .reduce((acc, event) => {
      const domain = extractDomain(event.referrer!);
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  return {
    ...stats,
    topReferrers: Object.entries(topReferrers)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([domain, count]) => ({ domain, count })),
  };
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'direct';
  }
}