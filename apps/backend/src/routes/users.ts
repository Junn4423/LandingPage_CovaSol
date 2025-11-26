import { Prisma } from '@prisma/client';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/require-auth';
import { createUser, deleteUser, listUsers, updateUser } from '../services/users.service';

export const usersRouter = Router();

const createUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
  displayName: z.string().min(2).optional(),
  role: z.string().optional()
});

const updateUserSchema = z.object({
  displayName: z.string().min(2).optional(),
  role: z.string().optional(),
  password: z.string().min(8).optional()
});

usersRouter.use(requireAuth);

usersRouter.get('/', async (_req, res) => {
  const users = await listUsers();
  res.json({ data: users });
});

usersRouter.post('/', async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
  }

  try {
    const user = await createUser(parsed.data);
    res.status(StatusCodes.CREATED).json({ data: user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(StatusCodes.CONFLICT).json({ message: 'Tên đăng nhập đã tồn tại.' });
    }
    throw error;
  }
});

usersRouter.put('/:id', async (req: AuthenticatedRequest, res) => {
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
  }

  if (req.params.id === req.user!.id && parsed.data.role && parsed.data.role !== req.user!.role) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Không thể tự thay đổi vai trò.' });
  }

  const user = await updateUser(req.params.id, parsed.data);
  res.json({ data: user });
});

usersRouter.delete('/:id', async (req: AuthenticatedRequest, res) => {
  if (req.params.id === req.user!.id) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Không thể tự xoá tài khoản.' });
  }
  await deleteUser(req.params.id);
  res.status(StatusCodes.NO_CONTENT).send();
});
