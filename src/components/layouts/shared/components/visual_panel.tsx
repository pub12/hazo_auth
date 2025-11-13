// file_description: reusable visual panel component for displaying images in authentication layouts
// section: client_directive
"use client";

// section: imports
import Image from "next/image";

// section: types
type VisualPanelProps = {
  imageSrc: string;
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
  return (
    <div
      className={`cls_visual_panel relative hidden h-full w-full items-center justify-center md:flex ${className ?? ""}`}
      style={{ backgroundColor }}
    >
      <div className="cls_visual_panel_image_wrapper relative h-full w-full">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="cls_visual_panel_image object-cover"
          priority
        />
      </div>
    </div>
  );
}

