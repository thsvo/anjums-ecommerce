import { NextApiRequest, NextApiResponse } from 'next';
import { uploadMultipleToImageBB } from '../../../lib/imagebb';
import formidable from 'formidable';
import fs from 'fs';

// Disable the default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFiles: 10,
      maxFileSize: 32 * 1024 * 1024, // 32MB (ImageBB limit)
      keepExtensions: true,
    });

    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Upload error:', err);
          res.status(500).json({ error: 'Upload failed' });
          return resolve(true);
        }

        try {
          const namePrefixField = fields.namePrefix;
          const namePrefix = Array.isArray(namePrefixField) ? namePrefixField[0] : namePrefixField;

          // Handle files - they could be an array or single file
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

          const imageResults = await uploadMultipleToImageBB(base64Images, namePrefix);

          res.status(200).json({
            success: true,
            images: imageResults,
            message: `Successfully uploaded ${imageResults.length} image(s) to ImageBB`,
          });
          
          return resolve(true);
        } catch (error) {
          console.error('Server error:', error);
          res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Server error' 
          });
          return resolve(true);
        }
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    });
  }
}
