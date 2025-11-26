// file_description: reusable visual panel component for displaying images in authentication layouts
// section: client_directive
"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// section: imports
import Image from "next/image";
// section: component
export function VisualPanel({ imageSrc, imageAlt, backgroundColor = "#f1f5f9", className, }) {
    return (_jsx("div", { className: `cls_visual_panel relative hidden h-full w-full items-center justify-center md:flex ${className !== null && className !== void 0 ? className : ""}`, style: { backgroundColor }, children: _jsx("div", { className: "cls_visual_panel_image_wrapper relative h-full w-full", children: _jsx(Image, { src: imageSrc, alt: imageAlt, fill: true, sizes: "(min-width: 768px) 50vw, 100vw", className: "cls_visual_panel_image object-cover", priority: true }) }) }));
}
