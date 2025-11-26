import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma';
import type { UserSummary } from '@/types/content';

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

function toUserSummary(user: { id: string; username: string; displayName: string | null; role: string; createdAt: Date; updatedAt: Date }): UserSummary {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

export async function listUsers(): Promise<UserSummary[]> {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  return users.map(toUserSummary);
}

export async function createUser(input: CreateUserInput): Promise<UserSummary> {
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      username: input.username,
      passwordHash,
      displayName: input.displayName,
      role: input.role ?? 'admin'
    }
  });
  return toUserSummary(user);
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<UserSummary> {
  const passwordHash = input.password ? await bcrypt.hash(input.password, 12) : undefined;
  const user = await prisma.user.update({
    where: { id },
    data: {
      displayName: input.displayName,
      role: input.role,
      passwordHash
    }
  });
  return toUserSummary(user);
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } });
}
