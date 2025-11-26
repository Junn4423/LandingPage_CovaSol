import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { issueTokens, verifyCredentials, getUserProfile } from '../services/auth.service';
import { requireAuth, AuthenticatedRequest } from '../middleware/require-auth';

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(4)
});

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
  }

  const user = await verifyCredentials(parsed.data);
  if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Sai thông tin đăng nhập' });
  }

  const { accessToken, refreshToken } = issueTokens(user);

  res
    .cookie('cova_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 4
    })
    .cookie('cova_refresh', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7
    })
    .json({
      data: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role
      }
    });
});

authRouter.post('/logout', (_req, res) => {
  res
    .clearCookie('cova_token')
    .clearCookie('cova_refresh')
    .status(StatusCodes.NO_CONTENT)
    .send();
});

authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  const profile = await getUserProfile(req.user!.id);
  if (!profile) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy người dùng' });
  }
  return res.json({ data: profile });
});
