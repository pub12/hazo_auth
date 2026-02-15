// file_description: reusable visual panel component for displaying images in authentication layouts
// section: client_directive
"use client";

// section: imports
import Image, { type StaticImageData } from "next/image";
import { useState } from "react";

// section: types
type VisualPanelProps = {
  imageSrc: string | StaticImageData;
  imageAlt: string;
  backgroundColor?: string;
  className?: string;
};

// section: component
export function VisualPanel({
  imageSrc,
  imageAlt,
  backgroundColor = "#f1f5f9",
  className,
}: VisualPanelProps) {
  const [imageError, setImageError] = useState(false);
  const isJpgString = typeof imageSrc === 'string' && (imageSrc.toLowerCase().endsWith('.jpg') || imageSrc.toLowerCase().endsWith('.jpeg'));

  return (
    <div
      className={`cls_visual_panel relative hidden h-full w-full items-center justify-center md:flex ${className ?? ""}`}
      style={{ backgroundColor }}
    >
      <div className="cls_visual_panel_image_wrapper relative h-full w-full">
        {imageError ? (
          <div
            className="cls_visual_panel_fallback h-full w-full"
            style={{ backgroundColor }}
            role="img"
            aria-label={imageAlt}
          />
        ) : (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="cls_visual_panel_image object-cover"
            priority
            unoptimized={isJpgString}
            onError={() => setImageError(true)}
          />
        )}
      </div>
    </div>
  );
}
