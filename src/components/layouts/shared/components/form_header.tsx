// file_description: reusable form header component for displaying heading and subheading in authentication layouts
// section: types
type FormHeaderProps = {
  heading: string;
  subHeading: string;
  className?: string;
  headingClassName?: string;
  subHeadingClassName?: string;
};

// section: component
export function FormHeader({
  heading,
  subHeading,
  className,
  headingClassName,
  subHeadingClassName,
}: FormHeaderProps) {
  return (
    <header
      className={`cls_form_header flex flex-col gap-2 text-center md:text-left ${className ?? ""}`}
    >
      <h1
        className={`cls_form_header_title text-2xl font-semibold text-slate-900 ${headingClassName ?? ""}`}
      >
        {heading}
      </h1>
      <p
        className={`cls_form_header_subtitle text-sm text-slate-600 ${subHeadingClassName ?? ""}`}
      >
        {subHeading}
      </p>
    </header>
  );
}

