import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import ImageBBUpload from '../../../components/ImageBBUpload';
import { useProductImageUpload } from '../../../hooks/useImageBBUpload';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Upload, Image as ImageIcon, ExternalLink, Copy, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  featured: boolean;
  category: {
    id: string;
    name: string;
  };
  images: {
    id: string;
    url: string;
    isMain: boolean;
  }[];
}

interface Category {
  id: string;
  name: string;
}

interface UploadedImage {
  id: string;
  url: string;
  deleteUrl: string;
  originalName?: string;
  size: number;
  width: number;
  height: number;
  viewerUrl: string;
  thumbUrl: string;
  mediumUrl: string;
}

const AdminProductsImageBB: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    featured: false,
  });

  const { uploadImages, uploading: imageUploading } = useProductImageUpload();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImagesUploaded = (images: UploadedImage[]) => {
    setUploadedImages(images);
  };

  const openDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        categoryId: product.category.id,
        featured: product.featured,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '',
        featured: false,
      });
    }
    setUploadedImages([]);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setUploadedImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: uploadedImages.map(img => ({
          url: img.url,
          isMain: uploadedImages.indexOf(img) === 0, // First image is main
        })),
      };

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}`, productData);
      } else {
        await axios.post('/api/products', productData);
      }

      await fetchProducts();
      closeDialog();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Products with ImageBB</h1>
          <Button onClick={() => openDialog()}>
            Add Product with ImageBB
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square bg-gray-100">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images.find(img => img.isMain)?.url || product.images[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">${product.price}</span>
                  <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                    Stock: {product.stock}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{product.category.name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDialog(product)}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Edit Product Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'} with ImageBB
              </DialogTitle>
              <DialogDescription>
                Use ImageBB for reliable image hosting and CDN delivery.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="images">Images (ImageBB)</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoryId">Category</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <Label htmlFor="featured">Featured Product</Label>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">ImageBB Integration</h4>
                    <p className="text-sm text-blue-700">
                      Images are uploaded to ImageBB and hosted on their CDN for fast, reliable delivery. 
                      The first image will be set as the main product image.
                    </p>
                  </div>

                  <ImageBBUpload
                    onImagesUploaded={handleImagesUploaded}
                    maxFiles={10}
                    namePrefix={formData.name ? `product_${formData.name.toLowerCase().replace(/\s+/g, '_')}` : 'product'}
                    showPreview={true}
                  />

                  {uploadedImages.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Selected Images for Product</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {uploadedImages.map((image, index) => (
                          <Card key={image.id}>
                            <CardContent className="p-3">
                              <div className="flex items-start gap-3">
                                <img
                                  src={image.thumbUrl}
                                  alt={`Product ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium">
                                      Image {index + 1}
                                    </span>
                                    {index === 0 && (
                                      <Badge variant="secondary" className="text-xs">
                                        Main
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 truncate">
                                    {image.width} × {image.height} • {(image.size / 1024).toFixed(1)} KB
                                  </p>
                                  <div className="flex gap-1 mt-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="text-xs h-6"
                                      onClick={() => copyImageUrl(image.url)}
                                    >
                                      <Copy className="h-3 w-3 mr-1" />
                                      Copy URL
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="text-xs h-6"
                                      onClick={() => window.open(image.viewerUrl, '_blank')}
                                    >
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      View
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={imageUploading || uploadedImages.length === 0}
                >
                  {imageUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {editingProduct ? 'Update' : 'Create'} Product
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProductsImageBB;
