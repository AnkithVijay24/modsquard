import React from 'react';

interface Image {
  id: string;
  url: string;
  buildId?: string;
  createdAt?: string;
}

interface ImageGridProps {
  images: Image[];
  height?: string;
  onClick?: () => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, height = "h-48", onClick }) => {
  if (!images || images.length === 0) {
    return (
      <div className={`w-full ${height} flex items-center justify-center bg-gray-100`}>
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    target.src = 'https://placehold.co/600x400?text=Error+Loading+Image';
  };

  // Different layouts based on number of images
  switch (images.length) {
    case 1:
      return (
        <div className={`relative w-full ${height} cursor-pointer`} onClick={onClick}>
          <img
            src={images[0].url}
            alt="Vehicle"
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>
      );

    case 2:
      return (
        <div className={`grid grid-cols-2 gap-1 ${height} cursor-pointer`} onClick={onClick}>
          {images.map((image, index) => (
            <div key={image.id} className="relative h-full">
              <img
                src={image.url}
                alt={`Vehicle ${index + 1}`}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
          ))}
        </div>
      );

    case 3:
      return (
        <div className={`grid grid-cols-2 gap-1 ${height} cursor-pointer`} onClick={onClick}>
          <div className="relative h-full">
            <img
              src={images[0].url}
              alt="Vehicle 1"
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>
          <div className="grid grid-rows-2 gap-1 h-full">
            {images.slice(1).map((image, index) => (
              <div key={image.id} className="relative h-full">
                <img
                  src={image.url}
                  alt={`Vehicle ${index + 2}`}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
            ))}
          </div>
        </div>
      );

    case 4:
      return (
        <div className={`grid grid-cols-2 gap-1 ${height} cursor-pointer`} onClick={onClick}>
          {images.map((image, index) => (
            <div key={image.id} className="relative h-full">
              <img
                src={image.url}
                alt={`Vehicle ${index + 1}`}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
          ))}
        </div>
      );

    case 5:
      return (
        <div className={`grid grid-cols-2 gap-1 ${height} cursor-pointer`} onClick={onClick}>
          <div className="relative h-full">
            <img
              src={images[0].url}
              alt="Vehicle 1"
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>
          <div className="grid grid-rows-2 gap-1 h-full">
            <div className="grid grid-cols-2 gap-1">
              {images.slice(1, 3).map((image, index) => (
                <div key={image.id} className="relative h-full">
                  <img
                    src={image.url}
                    alt={`Vehicle ${index + 2}`}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {images.slice(3).map((image, index) => (
                <div key={image.id} className="relative h-full">
                  <img
                    src={image.url}
                    alt={`Vehicle ${index + 4}`}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default ImageGrid; 