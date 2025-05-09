'use client';

import { useState } from 'react';

interface ActivityGalleryProps {
  images: string[];
  title: string;
}

export default function ActivityGallery({ images, title }: ActivityGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  
  return (
    <div>
      <div className="relative aspect-w-16 aspect-h-9 rounded-lg overflow-hidden mb-4">
        <img
          src={images[activeImage]}
          alt={`${title} - ${activeImage + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            className={`aspect-w-1 aspect-h-1 rounded-md overflow-hidden ${
              index === activeImage ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveImage(index)}
          >
            <img
              src={image}
              alt={`${title} - Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}