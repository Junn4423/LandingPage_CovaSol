import { prisma } from '../db/prisma';

export interface NewsletterSubscriptionInput {
  email: string;
  name?: string;
  source?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  name?: string;
  status: string;
  source?: string;
  subscribedAt: string;
  unsubscribedAt?: string;
}

function toSubscription(sub: any): NewsletterSubscription {
  return {
    id: String(sub.id),
    email: sub.email,
    name: sub.name || undefined,
    status: sub.status,
    source: sub.source || undefined,
    subscribedAt: sub.subscribedAt.toISOString(),
    unsubscribedAt: sub.unsubscribedAt?.toISOString()
  };
}

// Subscribe to newsletter
export async function subscribeToNewsletter(input: NewsletterSubscriptionInput): Promise<NewsletterSubscription> {
  const existing = await prisma.newsletterSubscription.findUnique({
    where: { email: input.email }
  });

  if (existing) {
    // Reactivate if previously unsubscribed
    if (existing.status === 'unsubscribed') {
      const updated = await prisma.newsletterSubscription.update({
        where: { id: existing.id },
        data: {
          status: 'active',
          source: input.source,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          subscribedAt: new Date(),
          unsubscribedAt: null
        }
      });
      return toSubscription(updated);
    }
    // Already subscribed
    return toSubscription(existing);
  }

  const subscription = await prisma.newsletterSubscription.create({
    data: {
      email: input.email,
      name: input.name,
      source: input.source,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent
    }
  });

  return toSubscription(subscription);
}

// Unsubscribe from newsletter
export async function unsubscribeFromNewsletter(email: string): Promise<boolean> {
  const existing = await prisma.newsletterSubscription.findUnique({
    where: { email }
  });

  if (!existing || existing.status === 'unsubscribed') {
    return false;
  }

  await prisma.newsletterSubscription.update({
    where: { id: existing.id },
    data: {
      status: 'unsubscribed',
      unsubscribedAt: new Date()
    }
  });

  return true;
}

// Get all subscriptions (admin)
export async function getAllSubscriptions(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}): Promise<{ subscriptions: NewsletterSubscription[]; total: number; page: number; pageSize: number }> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const skip = (page - 1) * pageSize;

  const where = params?.status ? { status: params.status } : {};

  const [subscriptions, total] = await Promise.all([
    prisma.newsletterSubscription.findMany({
      where,
      orderBy: { subscribedAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.newsletterSubscription.count({ where })
  ]);

  return {
    subscriptions: subscriptions.map(toSubscription),
    total,
    page,
    pageSize
  };
}

// Get subscription stats (admin)
export async function getSubscriptionStats(): Promise<{
  totalActive: number;
  totalUnsubscribed: number;
  totalThisMonth: number;
}> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalActive, totalUnsubscribed, totalThisMonth] = await Promise.all([
    prisma.newsletterSubscription.count({ where: { status: 'active' } }),
    prisma.newsletterSubscription.count({ where: { status: 'unsubscribed' } }),
    prisma.newsletterSubscription.count({
      where: {
        status: 'active',
        subscribedAt: { gte: startOfMonth }
      }
    })
  ]);

  return {
    totalActive,
    totalUnsubscribed,
    totalThisMonth
  };
}

// Delete subscription (admin)
export async function deleteSubscription(id: number): Promise<void> {
  await prisma.newsletterSubscription.delete({
    where: { id }
  });
}
