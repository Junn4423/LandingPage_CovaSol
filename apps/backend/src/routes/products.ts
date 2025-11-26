import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getProductBySlugOrId, listPublishedProducts } from '../services/products.service';

export const productRouter = Router();

productRouter.get('/', async (_req, res) => {
  const products = await listPublishedProducts();
  res.json({ data: products });
});

productRouter.get('/:id', async (req, res) => {
  const product = await getProductBySlugOrId(req.params.id);
  if (!product) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy sản phẩm' });
  }
  return res.json({ data: product });
});
