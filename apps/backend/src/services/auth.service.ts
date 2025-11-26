import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma';
import { config } from '../config';

export interface LoginPayload {
  username: string;
  password: string;
}

export function issueTokens(user: { id: string; username: string; displayName?: string; role?: string }) {
  const accessToken = jwt.sign(user, config.jwt.secret as jwt.Secret, {
    expiresIn: config.jwt.expiresIn
  } as jwt.SignOptions);
  const refreshToken = jwt.sign({ userId: user.id }, config.refreshToken.secret as jwt.Secret, {
    expiresIn: config.refreshToken.expiresIn
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
}

export async function verifyCredentials(payload: LoginPayload) {
  const user = await prisma.user.findUnique({ where: { username: payload.username } });
  if (!user) {
    return null;
  }

  const isMatch = await bcrypt.compare(payload.password, user.passwordHash);
  if (!isMatch) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName ?? undefined,
    role: user.role
  };
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role
  };
}
