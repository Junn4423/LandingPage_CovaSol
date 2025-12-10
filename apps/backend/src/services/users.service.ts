import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma';
import type { UserSummary } from '../types/covasol';

export interface CreateUserInput {
  username: string;
  password: string;
  displayName?: string;
  role?: string;
  avatar?: string;
}

export interface UpdateUserInput {
  displayName?: string;
  role?: string;
  password?: string;
  avatar?: string | null;
}

function toUserSummary(user: { id: number; username: string; displayName: string; avatar?: string | null; role: string; createdAt: Date; updatedAt: Date }): UserSummary {
  return {
    id: String(user.id),
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar ?? undefined,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

export async function listUsers(): Promise<UserSummary[]> {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  return users.map(u => toUserSummary(u as any));
}

export async function createUser(input: CreateUserInput): Promise<UserSummary> {
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      username: input.username,
      passwordHash,
      displayName: input.displayName || input.username,
      avatar: input.avatar,
      role: input.role ?? 'admin'
    }
  });
  return toUserSummary(user as any);
}

export async function updateUser(id: number | string, input: UpdateUserInput): Promise<UserSummary> {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  const passwordHash = input.password ? await bcrypt.hash(input.password, 12) : undefined;
  const user = await prisma.user.update({
    where: { id: numId },
    data: {
      displayName: input.displayName,
      role: input.role,
      avatar: input.avatar,
      passwordHash
    }
  });
  return toUserSummary(user as any);
}

export async function deleteUser(id: number | string) {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  await prisma.user.delete({ where: { id: numId } });
}

/**
 * Check if an author name matches any user's displayName
 * Returns the user if found, null otherwise
 */
export async function findUserByDisplayName(displayName: string) {
  if (!displayName?.trim()) return null;
  
  // MySQL collation is typically case-insensitive by default
  const user = await prisma.user.findFirst({
    where: { 
      displayName: displayName.trim()
    }
  });
  
  return user ? toUserSummary(user as any) : null;
}

/**
 * Check if an author name exists in the user database
 */
export async function isAuthorNameRegistered(authorName: string): Promise<boolean> {
  const user = await findUserByDisplayName(authorName);
  return user !== null;
}
