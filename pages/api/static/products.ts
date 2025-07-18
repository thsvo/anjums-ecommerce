import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// It's recommended to set this in your .env file for security
const STATIC_TOKEN = 'haomao123';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token || token !== STATIC_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing static token.' });
  }

  try {
    const { page = 1, limit = 10, search, categoryId, sortBy } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId as string;
    }

    let orderBy: any = { createdAt: 'desc' };

    switch (sortBy) {
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'featured':
        orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          category: true,
          reviews: {
            select: {
              rating: true,
            },
          },
          images: true,
        },
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithRating = products.map((product) => ({
      ...product,
      averageRating:
        product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0,
      reviewCount: product.reviews.length,
    }));

    if (sortBy === 'rating') {
      productsWithRating.sort((a, b) => b.averageRating - a.averageRating);
    }

    res.status(200).json({
      products: productsWithRating,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / take),
        totalItems: total,
        hasNext: skip + take < total,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error) {
    console.error('Static products API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
