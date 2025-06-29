import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid order ID' });
  }

  try {
    if (req.method === 'GET') {
      // Get specific order details
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            }
          }
        }
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.status(200).json(order);
    } else if (req.method === 'PUT') {
      // Update order status
      const { status, paymentStatus } = req.body;

      const updateData: any = {};

      if (status) {
        updateData.status = status;
      }

      if (paymentStatus) {
        updateData.paymentStatus = paymentStatus;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            }
          }
        }
      });

      res.status(200).json(updatedOrder);
    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin order API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
