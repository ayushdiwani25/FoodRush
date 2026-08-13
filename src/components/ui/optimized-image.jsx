import React, { useState } from "react";

export function OptimizedImage({
  src,
  alt = "FoodRush image",
  className = "",
  aspectRatio = "aspect-video",
  objectFit = "object-cover",
  fallbackSrc = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-neutral-100 ${aspectRatio} ${className}`}>
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-linear-to-r from-neutral-200 via-neutral-100 to-neutral-200 animate-pulse"
          aria-hidden="true"
        />
      )}

      <img
        src={hasError ? fallbackSrc : src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={`w-full h-full ${objectFit} transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        {...props}
      />
    </div>
  );
}

export default OptimizedImage;
