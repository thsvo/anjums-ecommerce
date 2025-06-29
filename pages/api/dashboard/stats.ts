import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Get dashboard statistics
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      recentOrders,
      topProducts
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
          price: true
        },
        _count: {
          productId: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      })
    ]);

    // Calculate total revenue
    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        total: true
      }
    });

    // Get product details for top products
    const topProductIds = topProducts.map(p => p.productId);
    const productDetails = await prisma.product.findMany({
      where: {
        id: {
          in: topProductIds
        }
      }
    });

    const topProductsWithDetails = topProducts.map(product => {
      const details = productDetails.find(p => p.id === product.productId);
      return {
        id: product.productId,
        name: details?.name || 'Unknown Product',
        sales: product._sum.quantity || 0,
        revenue: product._sum.price || 0
      };
    });

    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.id,
      customer: `${order.user.firstName} ${order.user.lastName}`,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt
    }));

    res.status(200).json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue._sum.total || 0,
      recentOrders: formattedRecentOrders,
      topProducts: topProductsWithDetails
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
