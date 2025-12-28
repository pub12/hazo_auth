// file_description: test app register page - uses new zero-config RegisterPage server component
// section: imports
import RegisterPage from "../../../server_pages/register";

// section: component
/**
 * Test app register page
 * Uses the zero-config RegisterPage server component which includes AuthPageShell internally
 */
export default function register_page() {
  return <RegisterPage />;
}
