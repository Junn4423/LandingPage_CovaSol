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
  role: z.string().optional(),
  avatar: z.string().url().optional()
});

const updateUserSchema = z.object({
  displayName: z.string().min(2).optional(),
  role: z.string().optional(),
  password: z.string().min(8).optional(),
  avatar: z.string().url().optional().nullable()
});

usersRouter.use(requireAuth);

usersRouter.get('/', async (req: AuthenticatedRequest, res) => {
  // ADMIN can only see their own user
  if (req.user?.role === 'ADMIN') {
    const users = await listUsers();
    const ownUser = users.filter(u => u.id === String(req.user!.id));
    return res.json({ data: ownUser });
  }
  const users = await listUsers();
  res.json({ data: users });
});

usersRouter.post('/', async (req: AuthenticatedRequest, res) => {
  // Only SUPER_ADMIN can create users
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(StatusCodes.FORBIDDEN).json({ message: 'Chỉ Super Admin mới có thể tạo người dùng mới.' });
  }

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

  const targetId = req.params.id;
  const currentUserId = String(req.user!.id);
  const currentUserRole = req.user!.role;

  // ADMIN can only edit their own profile (no role change)
  if (currentUserRole === 'ADMIN') {
    if (targetId !== currentUserId) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Bạn chỉ có thể chỉnh sửa thông tin của bản thân.' });
    }
    // ADMIN cannot change their own role
    if (parsed.data.role && parsed.data.role !== currentUserRole) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Bạn không có quyền thay đổi vai trò.' });
    }
    // Remove role from update for ADMIN
    delete parsed.data.role;
  }

  // SUPER_ADMIN cannot change their own role
  if (targetId === currentUserId && parsed.data.role && parsed.data.role !== currentUserRole) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Không thể tự thay đổi vai trò.' });
  }

  const user = await updateUser(targetId, parsed.data);
  res.json({ data: user });
});

usersRouter.delete('/:id', async (req: AuthenticatedRequest, res) => {
  // Only SUPER_ADMIN can delete users
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(StatusCodes.FORBIDDEN).json({ message: 'Chỉ Super Admin mới có thể xoá người dùng.' });
  }

  if (req.params.id === String(req.user!.id)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Không thể tự xoá tài khoản.' });
  }
  await deleteUser(req.params.id);
  res.status(StatusCodes.NO_CONTENT).send();
});
