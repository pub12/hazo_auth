// file_description: reusable two-column authentication layout shell that combines visual panel and form content
// section: imports
import { VisualPanel } from "./visual_panel";
import type { StaticImageData } from "next/image";

// section: types
type TwoColumnAuthLayoutProps = {
  imageSrc: string | StaticImageData;
  imageAlt: string;
  imageBackgroundColor?: string;
  formContent: React.ReactNode;
  className?: string;
  visualPanelClassName?: string;
  formContainerClassName?: string;
};

// section: component
export function TwoColumnAuthLayout({
  imageSrc,
  imageAlt,
  imageBackgroundColor,
  formContent,
  className,
  visualPanelClassName,
  formContainerClassName,
}: TwoColumnAuthLayoutProps) {
  return (
    <div
      className={`cls_two_column_auth_layout mx-6 my-8 grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:mx-8 md:mx-auto md:my-12 md:grid-cols-2 md:min-h-[520px] ${className ?? ""}`}
    >
      <VisualPanel
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        backgroundColor={imageBackgroundColor}
        className={visualPanelClassName}
      />
      <div
        className={`cls_two_column_auth_layout_form_container flex flex-col gap-6 p-8 ${formContainerClassName ?? ""}`}
      >
        {formContent}
      </div>
    </div>
  );
}

