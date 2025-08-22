import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Disable the default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const { page = 1, limit = 10, search, categoryId: queryCategoryId, sortBy } = req.query;
        
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        
        const where: any = {};
        
        if (search) {
          where.OR = [
            { name: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } }
          ];
        }
        
        if (queryCategoryId) {
          where.categoryId = queryCategoryId as string;
        }

        // Handle sorting
        let orderBy: any = { createdAt: 'desc' }; // default sort
        
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
                  rating: true
                }
              },
              images: true
            },
            orderBy
          }),
          prisma.product.count({ where })
        ]);
        
        // Calculate average rating for each product
        let productsWithRating = products.map(product => ({
          ...product,
          averageRating: product.reviews.length > 0 
            ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
            : 0,
          reviewCount: product.reviews.length
        }));

        // Handle rating sort (needs to be done after calculation)
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
            hasPrev: Number(page) > 1
          }
        });
        break;
        
      case 'POST':
        return new Promise((resolve, reject) => {
          const form = formidable({
            uploadDir,
            keepExtensions: true,
            maxFiles: 10,
            maxFileSize: 10 * 1024 * 1024, // 10MB
          });

          form.parse(req, async (err, fields, files) => {
            if (err) {
              console.error('Upload error:', err);
              res.status(500).json({ error: 'Upload failed' });
              return resolve(true);
            }

            try {
              const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
              const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
              const price = Array.isArray(fields.price) ? fields.price[0] : fields.price;
              const salePrice = Array.isArray(fields.salePrice) ? fields.salePrice[0] : fields.salePrice;
              const categoryId = Array.isArray(fields.categoryId) ? fields.categoryId[0] : fields.categoryId;
              const stock = Array.isArray(fields.stock) ? fields.stock[0] : fields.stock;
              const featured = Array.isArray(fields.featured) ? fields.featured[0] : fields.featured;

              if (!name || !price || !categoryId) {
                res.status(400).json({ error: 'Name, price, and category are required' });
                return resolve(true);
              }

              // Create the product first
              const newProduct = await prisma.product.create({
                data: {
                  name: name!,
                  description: description || '',
                  price: parseFloat(price!),
                  stock: parseInt(stock || '0'),
                  categoryId: categoryId!,
                  featured: featured === 'true',
                  image: '' // We'll handle images separately
                },
                include: {
                  category: true
                }
              });

              // Handle multiple image uploads
              const uploadedFiles = Array.isArray(files.images) 
                ? files.images 
                : files.images ? [files.images] : [];

              if (uploadedFiles.length > 0) {
                const imageResults = [];

                for (let i = 0; i < uploadedFiles.length; i++) {
                  const file = uploadedFiles[i];
                  
                  // Generate a unique filename
                  const uniqueId = uuidv4();
                  const fileExt = path.extname(file.originalFilename || '');
                  const newFilename = `${uniqueId}${fileExt}`;
                  const finalPath = path.join(uploadDir, newFilename);

                  // Move the file to the final location
                  fs.renameSync(file.filepath, finalPath);

                  // Create a URL-friendly path
                  const imageUrl = `/uploads/${newFilename}`;

                  // Create the first image as main
                  const isMain = i === 0;

                  const image = await prisma.productImage.create({
                    data: {
                      url: imageUrl,
                      productId: newProduct.id,
                      isMain,
                    },
                  });

                  imageResults.push({
                    id: image.id,
                    url: image.url,
                    isMain: image.isMain,
                  });
                }

                // Update the product with the first image as main
                if (imageResults.length > 0) {
                  await prisma.product.update({
                    where: { id: newProduct.id },
                    data: { image: imageResults[0].url }
                  });
                }
              }

              res.status(201).json(newProduct);
              return resolve(true);
            } catch (error) {
              console.error('Server error:', error);
              res.status(500).json({ error: 'Server error' });
              return resolve(true);
            }
          });
        });
        break;

      case 'PUT':
        return new Promise((resolve, reject) => {
          const form = formidable({
            uploadDir,
            keepExtensions: true,
            maxFiles: 10,
            maxFileSize: 10 * 1024 * 1024, // 10MB
          });

          form.parse(req, async (err, fields, files) => {
            if (err) {
              console.error('Upload error:', err);
              res.status(500).json({ error: 'Upload failed' });
              return resolve(true);
            }

            try {
              const productId = Array.isArray(fields.id) ? fields.id[0] : fields.id;
              const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
              const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
              const price = Array.isArray(fields.price) ? fields.price[0] : fields.price;
              const salePrice = Array.isArray(fields.salePrice) ? fields.salePrice[0] : fields.salePrice;
              const categoryId = Array.isArray(fields.categoryId) ? fields.categoryId[0] : fields.categoryId;
              const stock = Array.isArray(fields.stock) ? fields.stock[0] : fields.stock;
              const featured = Array.isArray(fields.featured) ? fields.featured[0] : fields.featured;

              if (!productId || !name || !price || !categoryId) {
                res.status(400).json({ error: 'Product ID, name, price, and category are required' });
                return resolve(true);
              }

              // Update the product
              const updatedProduct = await prisma.product.update({
                where: { id: productId },
                data: {
                  name,
                  description: description || '',
                  price: parseFloat(price),
                  stock: parseInt(stock || '0'),
                  categoryId,
                  featured: featured === 'true',
                },
                include: {
                  category: true
                }
              });

              // Handle multiple image uploads
              const uploadedFiles = Array.isArray(files.images) 
                ? files.images 
                : files.images ? [files.images] : [];

              if (uploadedFiles.length > 0) {
                // Delete existing images for this product
                await prisma.productImage.deleteMany({
                  where: { productId }
                });

                const imageResults = [];

                for (let i = 0; i < uploadedFiles.length; i++) {
                  const file = uploadedFiles[i];
                  
                  // Generate a unique filename
                  const uniqueId = uuidv4();
                  const fileExt = path.extname(file.originalFilename || '');
                  const newFilename = `${uniqueId}${fileExt}`;
                  const finalPath = path.join(uploadDir, newFilename);

                  // Move the file to the final location
                  fs.renameSync(file.filepath, finalPath);

                  // Create a URL-friendly path
                  const imageUrl = `/uploads/${newFilename}`;

                  // Create the first image as main
                  const isMain = i === 0;

                  const image = await prisma.productImage.create({
                    data: {
                      url: imageUrl,
                      productId: updatedProduct.id,
                      isMain,
                    },
                  });

                  imageResults.push({
                    id: image.id,
                    url: image.url,
                    isMain: image.isMain,
                  });
                }

                // Update the product with the first image as main
                if (imageResults.length > 0) {
                  await prisma.product.update({
                    where: { id: updatedProduct.id },
                    data: { image: imageResults[0].url }
                  });
                }
              }

              res.status(200).json(updatedProduct);
              return resolve(true);
            } catch (error) {
              console.error('Server error:', error);
              res.status(500).json({ error: 'Server error' });
              return resolve(true);
            }
          });
        });
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Products API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
