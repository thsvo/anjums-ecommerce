import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { uploadMultipleToImageBB } from '../../../lib/imagebb';
import formidable from 'formidable';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = formidable({
      keepExtensions: true,
      maxFiles: 10,
      maxFileSize: 32 * 1024 * 1024, // 32MB (ImageBB limit)
    });

    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Upload error:', err);
          res.status(500).json({ error: 'Upload failed' });
          return resolve(true);
        }

        try {
          const productId = Array.isArray(fields.productId) ? fields.productId[0] : fields.productId;
          const isMain = Array.isArray(fields.isMain) ? fields.isMain[0] : fields.isMain;
          const isNew = Array.isArray(fields.isNew) ? fields.isNew[0] : fields.isNew;
          
          // Check if files is an array
          const uploadedFiles = Array.isArray(files.files) 
            ? files.files 
            : files.files ? [files.files] : [];
          
          if (uploadedFiles.length === 0) {
            res.status(400).json({ error: 'No files uploaded' });
            return resolve(true);
          }

          const base64Images = uploadedFiles.map(file => {
            const fileBuffer = fs.readFileSync(file.filepath);
            fs.unlinkSync(file.filepath); // Clean up temp file
            return fileBuffer.toString('base64');
          });

          const namePrefix = productId ? `product_${productId}` : `temp_product_${Date.now()}`;
          const uploadResults = await uploadMultipleToImageBB(base64Images, namePrefix);

          const imageResults = await Promise.all(uploadResults.map(async (uploadResult, i) => {
            if (isNew === 'true') {
              return {
                id: `temp_${uuidv4()}`,
                url: uploadResult.url,
                isMain: isMain === 'true' && i === 0,
                imageBBId: uploadResult.id,
                deleteUrl: uploadResult.deleteUrl,
                thumbUrl: uploadResult.thumbUrl,
                mediumUrl: uploadResult.mediumUrl,
              };
            } else {
              if (!productId) {
                throw new Error('productId is required for existing products');
              }
              const image = await prisma.productImage.create({
                data: {
                  url: uploadResult.url,
                  productId: productId,
                  isMain: isMain === 'true' && i === 0,
                },
              });
              return {
                id: image.id,
                url: image.url,
                isMain: image.isMain,
                imageBBId: uploadResult.id,
                deleteUrl: uploadResult.deleteUrl,
                thumbUrl: uploadResult.thumbUrl,
                mediumUrl: uploadResult.mediumUrl,
              };
            }
          }));

          res.status(200).json({ 
            success: true,
            images: imageResults,
            message: `Successfully uploaded ${imageResults.length} product image(s) to ImageBB`
          });
          return resolve(true);
        } catch (error) {
          console.error('Server error:', error);
          res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
          return resolve(true);
        }
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
