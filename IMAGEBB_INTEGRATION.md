# ImageBB Integration for Anjum's E-commerce

This project integrates with [ImageBB API](https://api.imgbb.com/) for reliable, fast image hosting with global CDN delivery. Perfect for product images, user avatars, and any other image assets.

## Features

- ✅ **Fast CDN Delivery**: Images served through ImageBB's global CDN
- ✅ **Multiple Image Sizes**: Automatic thumbnail, medium, and full-size generation
- ✅ **Reliable Storage**: 99.9% uptime with automatic backups
- ✅ **Easy Integration**: Custom React components and hooks
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Drag & Drop**: User-friendly upload interface
- ✅ **Batch Upload**: Multiple files at once
- ✅ **Direct Links**: Permanent, shareable image URLs

## Setup

### 1. Get ImageBB API Key

1. Visit [https://api.imgbb.com/](https://api.imgbb.com/)
2. Sign up for a free account
3. Get your API key from the dashboard

### 2. Environment Variables

Add your API key to `.env`:

```env
# ImageBB API Configuration
IMGBB_API_KEY=your_api_key_here
NEXT_PUBLIC_IMAGEBB_API_KEY=your_api_key_here
```

### 3. Install Dependencies

The required dependencies are already included in the project:

```bash
npm install
```

## Usage

### Basic Upload Component

```tsx
import ImageBBUpload from '../components/ImageBBUpload';

const MyComponent = () => {
  const handleImagesUploaded = (images) => {
    console.log('Uploaded images:', images);
  };

  return (
    <ImageBBUpload
      onImagesUploaded={handleImagesUploaded}
      maxFiles={5}
      namePrefix="product"
      showPreview={true}
    />
  );
};
```

### Using the Hook

```tsx
import { useImageBBUpload } from '../hooks/useImageBBUpload';

const MyComponent = () => {
  const { uploadImages, uploading, error } = useImageBBUpload();

  const handleFileSelect = async (files: File[]) => {
    try {
      const uploadedImages = await uploadImages(files, 'my_prefix');
      console.log('Upload successful:', uploadedImages);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      {uploading && <p>Uploading...</p>}
      {error && <p>Error: {error}</p>}
      <input 
        type="file" 
        multiple 
        onChange={(e) => e.target.files && handleFileSelect(Array.from(e.target.files))}
      />
    </div>
  );
};
```

### Specialized Hooks

#### Product Images
```tsx
import { useProductImageUpload } from '../hooks/useImageBBUpload';

const ProductForm = () => {
  const { uploadImages, uploading } = useProductImageUpload();

  const handleProductImages = async (files: File[], productName: string) => {
    const images = await uploadImages(files, productName);
    // Images will be named like: product_smartphone_1, product_smartphone_2, etc.
  };
};
```

#### Category Images
```tsx
import { useCategoryImageUpload } from '../hooks/useImageBBUpload';

const CategoryForm = () => {
  const { uploadImages, uploading } = useCategoryImageUpload();

  const handleCategoryImage = async (files: File[], categoryName: string) => {
    const images = await uploadImages(files, categoryName);
    // Images will be named like: category_electronics_1, etc.
  };
};
```

#### User Avatars
```tsx
import { useAvatarUpload } from '../hooks/useImageBBUpload';

const ProfileForm = () => {
  const { uploadImage, uploading } = useAvatarUpload();

  const handleAvatarUpload = async (file: File, username: string) => {
    const avatar = await uploadImage(file, username);
    // Single image named like: avatar_john_doe
  };
};
```

## API Endpoints

### Upload to ImageBB
```
POST /api/upload/imagebb
```

**Form Data:**
- `files`: Image files to upload
- `namePrefix`: Optional prefix for image names

**Response:**
```json
{
  "success": true,
  "images": [
    {
      "id": "abc123",
      "url": "https://i.ibb.co/abc123/image.jpg",
      "deleteUrl": "https://ibb.co/abc123/delete-token",
      "originalName": "image.jpg",
      "size": 1024000,
      "width": 1920,
      "height": 1080,
      "viewerUrl": "https://ibb.co/abc123",
      "thumbUrl": "https://i.ibb.co/abc123/thumb.jpg",
      "mediumUrl": "https://i.ibb.co/abc123/medium.jpg"
    }
  ]
}
```

## Components

### ImageBBUpload

Main upload component with drag & drop support.

**Props:**
- `onImagesUploaded`: Callback function when images are uploaded
- `maxFiles`: Maximum number of files (default: 5)
- `namePrefix`: Prefix for uploaded image names
- `showPreview`: Show preview of uploaded images (default: true)
- `acceptedTypes`: Array of accepted MIME types
- `maxFileSize`: Maximum file size in MB (default: 32)

### File Structure

```
components/
  ImageBBUpload.tsx         # Main upload component
  ui/
    tabs.tsx               # Radix UI tabs component

hooks/
  useImageBBUpload.ts      # Upload hooks

lib/
  imagebb.ts              # ImageBB utility functions

pages/
  api/
    upload/
      imagebb.ts          # Upload API endpoint
  admin/
    products/
      imagebb.tsx         # Admin products with ImageBB
  imagebb-demo.tsx        # Demo page

```

## Demo Pages

### Product Management with ImageBB
Visit `/admin/products/imagebb` to see the full product management interface with ImageBB integration.

### ImageBB Demo
Visit `/imagebb-demo` to test the ImageBB upload functionality and generate code snippets.

## Integration with Existing APIs

### Products
The product creation API automatically handles ImageBB images:

```javascript
// When creating a product
const productData = {
  name: 'Product Name',
  description: 'Description',
  price: 99.99,
  categoryId: 'category-id',
  images: [
    { url: 'https://i.ibb.co/abc123/image.jpg', isMain: true },
    { url: 'https://i.ibb.co/def456/image2.jpg', isMain: false }
  ]
};

await axios.post('/api/products', productData);
```

### Categories
Similar integration for category images:

```javascript
const categoryData = {
  name: 'Category Name',
  description: 'Description',
  image: 'https://i.ibb.co/abc123/category.jpg'
};

await axios.post('/api/categories', categoryData);
```

## Benefits of ImageBB

1. **Free Tier**: 32MB max file size, unlimited storage
2. **Global CDN**: Fast loading worldwide
3. **No Bandwidth Limits**: Serve as many images as needed
4. **Automatic Optimization**: WebP conversion, compression
5. **Multiple Formats**: Support for JPG, PNG, GIF, WebP
6. **Permanent Links**: Images never expire
7. **Direct Upload**: No need for server storage
8. **API Limits**: 5,000 uploads per hour on free plan

## Error Handling

The integration includes comprehensive error handling:

```tsx
const { uploadImages, uploading, error, clearError } = useImageBBUpload();

if (error) {
  console.error('Upload error:', error);
  // Handle error (show toast, etc.)
  clearError(); // Clear error state
}
```

## Security Considerations

- API key is exposed to client-side (NEXT_PUBLIC_*)
- ImageBB handles all security and CDN delivery
- No server-side storage needed
- Images are publicly accessible via direct URLs

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure `NEXT_PUBLIC_IMAGEBB_API_KEY` is set in `.env`
2. **File Size**: Maximum 32MB per file on ImageBB free plan
3. **Rate Limits**: 5,000 uploads per hour limit
4. **File Types**: Only image files are supported

### Debug Mode

Enable debug logging:

```tsx
const { uploadImages } = useImageBBUpload();

// The utility functions include console.error logging
// Check browser console for detailed error messages
```

## Migration from Local Storage

If you're migrating from local file storage:

1. Existing local images remain accessible
2. New uploads automatically use ImageBB
3. Update image URLs in database as needed
4. Gradually migrate existing images to ImageBB

---

For more information, visit the [ImageBB API Documentation](https://api.imgbb.com/).
