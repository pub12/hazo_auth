// file_description: render the register page shell and mount the register layout component
// section: imports
import register_layout from "@/components/layouts/register_layout";

// section: component
export default function register_page() {
  const RegisterLayout = register_layout;

  return (
    <div className="cls_register_page_wrapper flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <RegisterLayout
        image_src="/globe.svg"
        image_alt="Illustration of a globe representing secure authentication workflows"
        image_background_color="#e2e8f0"
      />
    </div>
  );
}

