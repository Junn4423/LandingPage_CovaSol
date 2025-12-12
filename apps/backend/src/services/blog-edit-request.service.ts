import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

export interface CreateEditRequestInput {
  blogPostId: number;
  requesterId: number;
  proposedData: Record<string, unknown>;
}

export interface EditRequestSummary {
  id: number;
  blogPostId: number;
  blogPostTitle: string;
  requesterId: number;
  requesterName: string;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
}

export interface EditRequestDetail extends EditRequestSummary {
  proposedData: Record<string, unknown>;
  reviewNote: string | null;
}

type EditRequestWithRelations = Prisma.BlogEditRequestGetPayload<{
  include: { blogPost: { select: { title: true } }; requester: { select: { displayName: true } } };
}>;

function toSummary(request: EditRequestWithRelations): EditRequestSummary {
  return {
    id: request.id,
    blogPostId: request.blogPostId,
    blogPostTitle: request.blogPost.title,
    requesterId: request.requesterId,
    requesterName: request.requester.displayName,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
    reviewedAt: request.reviewedAt?.toISOString() ?? null,
    reviewNote: request.reviewNote ?? null
  };
}

function toDetail(request: EditRequestWithRelations): EditRequestDetail {
  return {
    ...toSummary(request),
    proposedData: request.proposedData as Record<string, unknown>,
    reviewNote: request.reviewNote
  };
}

/**
 * Create a new edit request for a blog post
 */
export async function createEditRequest(input: CreateEditRequestInput): Promise<EditRequestDetail> {
  // Check if there's already a pending request from this user for this post
  const existing = await prisma.blogEditRequest.findFirst({
    where: {
      blogPostId: input.blogPostId,
      requesterId: input.requesterId,
      status: 'pending'
    }
  });

  if (existing) {
    // Update the existing pending request
    const updated = await prisma.blogEditRequest.update({
      where: { id: existing.id },
      data: { proposedData: input.proposedData as Prisma.InputJsonValue },
      include: {
        blogPost: { select: { title: true } },
        requester: { select: { displayName: true } }
      }
    });
    return toDetail(updated);
  }

  const request = await prisma.blogEditRequest.create({
    data: {
      blogPostId: input.blogPostId,
      requesterId: input.requesterId,
      proposedData: input.proposedData as Prisma.InputJsonValue
    },
    include: {
      blogPost: { select: { title: true } },
      requester: { select: { displayName: true } }
    }
  });

  return toDetail(request);
}

/**
 * Get all pending edit requests for a specific blog post (for the author to review)
 */
export async function getPendingRequestsForPost(blogPostId: number): Promise<EditRequestSummary[]> {
  const requests = await prisma.blogEditRequest.findMany({
    where: {
      blogPostId,
      status: 'pending'
    },
    include: {
      blogPost: { select: { title: true } },
      requester: { select: { displayName: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return requests.map(toSummary);
}

/**
 * Get all pending edit requests (for super-admin overview)
 */
export async function getAllPendingRequests(): Promise<EditRequestSummary[]> {
  const requests = await prisma.blogEditRequest.findMany({
    where: { status: 'pending' },
    include: {
      blogPost: { select: { title: true } },
      requester: { select: { displayName: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return requests.map(toSummary);
}

/**
 * Get all pending edit requests made by a specific user
 */
export async function getPendingRequestsByUser(requesterId: number): Promise<EditRequestSummary[]> {
  const requests = await prisma.blogEditRequest.findMany({
    where: {
      requesterId,
      status: 'pending'
    },
    include: {
      blogPost: { select: { title: true } },
      requester: { select: { displayName: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return requests.map(toSummary);
}

/**
 * Get all edit requests made by a specific user (any status)
 */
export async function getRequestsByUser(requesterId: number): Promise<EditRequestSummary[]> {
  const requests = await prisma.blogEditRequest.findMany({
    where: {
      requesterId
    },
    include: {
      blogPost: { select: { title: true } },
      requester: { select: { displayName: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return requests.map(toSummary);
}

/**
 * Get all pending edit requests for posts authored by a specific user
 */
export async function getPendingRequestsForAuthor(authorId: number): Promise<EditRequestSummary[]> {
  const requests = await prisma.blogEditRequest.findMany({
    where: {
      blogPost: { authorId },
      status: 'pending'
    },
    include: {
      blogPost: { select: { title: true } },
      requester: { select: { displayName: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return requests.map(toSummary);
}

/**
 * Get a specific edit request by ID
 */
export async function getEditRequestById(id: number): Promise<EditRequestDetail | null> {
  const request = await prisma.blogEditRequest.findUnique({
    where: { id },
    include: {
      blogPost: { select: { title: true } },
      requester: { select: { displayName: true } }
    }
  });

  return request ? toDetail(request) : null;
}

/**
 * Approve an edit request and apply the changes to the blog post
 */
export async function approveEditRequest(
  requestId: number,
  reviewNote?: string
): Promise<EditRequestDetail> {
  const request = await prisma.blogEditRequest.findUnique({
    where: { id: requestId },
    include: { blogPost: true }
  });

  if (!request) {
    throw new Error('Edit request not found');
  }

  if (request.status !== 'pending') {
    throw new Error('Edit request is not pending');
  }

  const proposedData = request.proposedData as Record<string, unknown>;

  // Apply the proposed changes to the blog post
  // Note: We keep the original authorId and authorName
  await prisma.blogPost.update({
    where: { id: request.blogPostId },
    data: {
      title: proposedData.title as string | undefined,
      subtitle: proposedData.subtitle as string | undefined,
      excerpt: proposedData.excerpt as string | undefined,
      content: proposedData.content as string | undefined,
      slug: proposedData.slug as string | undefined,
      category: proposedData.category as string | undefined,
      tags: proposedData.tags ? JSON.stringify(proposedData.tags) : undefined,
      keywords: proposedData.keywords ? JSON.stringify(proposedData.keywords) : undefined,
      imageUrl: proposedData.imageUrl as string | null | undefined,
      status: proposedData.status as string | undefined,
      publishedAt: proposedData.publishedAt ? new Date(proposedData.publishedAt as string) : undefined,
      isFeatured: proposedData.isFeatured !== undefined ? (proposedData.isFeatured ? 1 : 0) : undefined,
      // Don't update authorName, authorId, or authorRole - keep original author
      authorRole: proposedData.authorRole as string | undefined,
      galleryMedia: proposedData.galleryMedia as Prisma.InputJsonValue | undefined,
      videoItems: proposedData.videoItems as Prisma.InputJsonValue | undefined,
      sourceLinks: proposedData.sourceLinks as Prisma.InputJsonValue | undefined
    }
  });

  // Mark the request as approved
  const updated = await prisma.blogEditRequest.update({
    where: { id: requestId },
    data: {
      status: 'approved',
      reviewNote,
      reviewedAt: new Date()
    },
    include: {
      blogPost: { select: { title: true } },
      requester: { select: { displayName: true } }
    }
  });

  return toDetail(updated);
}

/**
 * Reject an edit request
 */
export async function rejectEditRequest(
  requestId: number,
  reviewNote?: string
): Promise<EditRequestDetail> {
  const request = await prisma.blogEditRequest.findUnique({
    where: { id: requestId }
  });

  if (!request) {
    throw new Error('Edit request not found');
  }

  if (request.status !== 'pending') {
    throw new Error('Edit request is not pending');
  }

  const updated = await prisma.blogEditRequest.update({
    where: { id: requestId },
    data: {
      status: 'rejected',
      reviewNote,
      reviewedAt: new Date()
    },
    include: {
      blogPost: { select: { title: true } },
      requester: { select: { displayName: true } }
    }
  });

  return toDetail(updated);
}

/**
 * Delete an edit request (only the requester can delete their own pending request)
 */
export async function deleteEditRequest(requestId: number, requesterId: number): Promise<void> {
  const request = await prisma.blogEditRequest.findUnique({
    where: { id: requestId }
  });

  if (!request) {
    throw new Error('Edit request not found');
  }

  if (request.requesterId !== requesterId) {
    throw new Error('You can only delete your own edit requests');
  }

  if (request.status !== 'pending') {
    throw new Error('Can only delete pending edit requests');
  }

  await prisma.blogEditRequest.delete({
    where: { id: requestId }
  });
}
