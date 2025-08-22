import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { X, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{
    id: string;
    url: string;
    isMain: boolean;
  }>;
  initialImageIndex?: number;
  productName?: string;
}

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  isOpen,
  onClose,
  images,
  initialImageIndex = 0,
  productName = 'Product'
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex);
  const [isMobile, setIsMobile] = useState(false);
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset rotation when image changes
  useEffect(() => {
    setRotation(0);
  }, [currentImageIndex]);

  // Set initial image index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(initialImageIndex);
    }
  }, [isOpen, initialImageIndex]);

  // Handle keyboard navigation and mobile detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;

      }
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentImageIndex]);

  const goToNext = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const goToPrevious = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };



  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };







  if (!isOpen) return null;

  // If no images provided, return null
  if (!images || images.length === 0) return null;

  const currentImage = images[currentImageIndex] || images[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95">
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-black/50 backdrop-blur-sm">
            <div className="flex items-center justify-between p-4">
              <div className="text-white">
                <h3 className="font-semibold">{productName}</h3>
                <p className="text-sm text-gray-300">
                  {currentImageIndex + 1} of {images.length}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main Image Container */}
          <div 
            ref={containerRef}
            className="flex-1 relative overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                ref={imageRef}
                src={currentImage.url}
                alt={`${productName} - Image ${currentImageIndex + 1}`}
                className="max-w-none transition-transform duration-200 select-none"
                style={{
                  transform: `rotate(${rotation}deg)`
                }}
                draggable={false}
              />
            </div>
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="lg"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={goToNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/50 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 p-4">
              <Button
                variant="ghost"
                size={isMobile ? "lg" : "sm"}
                onClick={rotate}
                className="text-white hover:bg-white/20"
              >
                <RotateCw className={isMobile ? "h-6 w-6" : "h-4 w-4"} />
              </Button>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
              <div className="flex gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-2 max-w-[80vw] overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? 'border-white'
                        : 'border-transparent hover:border-white/50'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="absolute top-20 right-4 z-20 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-xs max-w-[200px]">
            <div className="space-y-1">
              <div>← → to navigate</div>
              <div>ESC to close</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageZoomModal;