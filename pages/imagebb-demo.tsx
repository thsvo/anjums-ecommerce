import React, { useState } from 'react';
import Head from 'next/head';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import ImageBBUpload from '../components/ImageBBUpload';

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

const ImageBBDemo = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const handleImagesUploaded = (images: UploadedImage[]) => {
    setUploadedImages(images);
  };

  const clearAllImages = () => {
    setUploadedImages([]);
  };

  return (
    <>
      <Head>
        <title>ImageBB Upload Demo - E-commerce</title>
        <meta name="description" content="Test ImageBB image upload functionality" />
      </Head>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ImageBB Upload Demo
          </h1>
          <p className="text-gray-600">
            Test the ImageBB integration for uploading images to external hosting.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Upload Component */}
          <ImageBBUpload
            onImagesUploaded={handleImagesUploaded}
            maxFiles={5}
            namePrefix="demo"
            showPreview={true}
          />

          {/* Upload Status */}
          {uploadedImages.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upload Results</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} uploaded
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllImages}
                  >
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploadedImages.map((image, index) => (
                    <div key={image.id} className="border rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <img
                            src={image.mediumUrl}
                            alt={image.originalName || `Image ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">
                            {image.originalName || `Image ${index + 1}`}
                          </h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>ImageBB ID:</strong> {image.id}</p>
                            <p><strong>Dimensions:</strong> {image.width} × {image.height}</p>
                            <p><strong>Size:</strong> {(image.size / 1024).toFixed(2)} KB</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">URLs:</p>
                            <div className="text-xs space-y-1">
                              <div>
                                <span className="font-medium">Display:</span>
                                <input
                                  type="text"
                                  readOnly
                                  value={image.url}
                                  className="w-full mt-1 px-2 py-1 border rounded text-xs font-mono"
                                />
                              </div>
                              <div>
                                <span className="font-medium">Thumbnail:</span>
                                <input
                                  type="text"
                                  readOnly
                                  value={image.thumbUrl}
                                  className="w-full mt-1 px-2 py-1 border rounded text-xs font-mono"
                                />
                              </div>
                              <div>
                                <span className="font-medium">Viewer:</span>
                                <input
                                  type="text"
                                  readOnly
                                  value={image.viewerUrl}
                                  className="w-full mt-1 px-2 py-1 border rounded text-xs font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm">
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  Get your ImageBB API key from{' '}
                  <a 
                    href="https://api.imgbb.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    https://api.imgbb.com/
                  </a>
                </li>
                <li>
                  Add your API key to the <code>.env</code> file:
                  <pre className="bg-gray-100 p-2 rounded mt-1 text-xs">
                    IMGBB_API_KEY=your_actual_api_key_here
                  </pre>
                </li>
                <li>Restart your development server</li>
                <li>Upload images using the component above</li>
              </ol>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> ImageBB provides free image hosting with a generous API limit. 
                  Images are stored permanently (unless you set an expiration) and are accessible via CDN URLs.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ImageBBDemo;
