import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const product = await prisma.product.findUnique({
          where: { id },
          include: {
            category: true,
            reviews: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            },
            images: true
          }
        });

        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }

        const averageRating = product.reviews.length > 0 
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0;

        res.status(200).json({
          ...product,
          averageRating,
          reviewCount: product.reviews.length
        });
        break;

      case 'PUT':
        const { name, description, price, categoryId, image, stock, featured, tempImages } = req.body;

        const updatedProduct = await prisma.product.update({
          where: { id },
          data: {
            ...(name && { name }),
            ...(description && { description }),
            ...(price && { price: parseFloat(price) }),
            ...(categoryId && { categoryId }),
            ...(image && { image }),
            ...(stock !== undefined && { stock: parseInt(stock) }),
            ...(featured !== undefined && { featured: Boolean(featured) })
          },
          include: {
            category: true
          }
        });

        // If there are temporary images to be converted to permanent ones
        if (tempImages && Array.isArray(tempImages) && tempImages.length > 0) {
          await Promise.all(
            tempImages.map(async (tempImage: { url: string, isMain: boolean }) => {
              await prisma.productImage.create({
                data: {
                  url: tempImage.url,
                  productId: id,
                  isMain: tempImage.isMain,
                }
              });
            })
          );
          
          // If any image is set as main, ensure others are not main
          const hasMainImage = tempImages.some((img: { isMain: boolean }) => img.isMain);
          if (hasMainImage) {
            const existingImages = await prisma.productImage.findMany({
              where: { 
                productId: id,
                url: { notIn: tempImages.map((img: { url: string }) => img.url) },
                isMain: true
              }
            });
            
            if (existingImages.length > 0) {
              await Promise.all(
                existingImages.map(async (img) => {
                  await prisma.productImage.update({
                    where: { id: img.id },
                    data: { isMain: false }
                  });
                })
              );
            }
          }
        }

        res.status(200).json(updatedProduct);
        break;

      case 'DELETE':
        await prisma.product.delete({
          where: { id }
        });

        res.status(200).json({ message: 'Product deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Product API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
