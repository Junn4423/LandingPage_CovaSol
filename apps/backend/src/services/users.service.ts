import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma';
import type { UserSummary } from '../types/covasol';

export interface CreateUserInput {
  username: string;
  password: string;
  displayName?: string;
  role?: string;
}

export interface UpdateUserInput {
  displayName?: string;
  role?: string;
  password?: string;
}

function toUserSummary(user: { id: number; username: string; displayName: string; role: string; createdAt: Date; updatedAt: Date }): UserSummary {
  return {
    id: String(user.id),
    username: user.username,
    displayName: user.displayName,
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
      passwordHash
    }
  });
  return toUserSummary(user as any);
}

export async function deleteUser(id: number | string) {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  await prisma.user.delete({ where: { id: numId } });
}
