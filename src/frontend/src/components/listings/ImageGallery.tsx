import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ExternalBlob } from '../../backend';

interface ImageGalleryProps {
  images: ExternalBlob[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const hasImages = images.length > 0;
  const displayImages = hasImages
    ? images
    : [{ getDirectURL: () => '/assets/generated/placeholder-listing.dim_300x300.png' }];

  const currentImage = displayImages[selectedIndex].getDirectURL();

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-muted">
        <img src={currentImage} alt="Listing" className="h-full w-full object-contain" />

        {displayImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === selectedIndex ? 'bg-primary w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {displayImages.length > 1 && (
        <div className="grid grid-cols-6 gap-2 p-4">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`aspect-square overflow-hidden rounded-md border-2 transition-all ${
                index === selectedIndex ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img
                src={image.getDirectURL()}
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
