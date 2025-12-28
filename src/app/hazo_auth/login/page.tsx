// file_description: test app login page - uses new zero-config LoginPage server component
// section: imports
import LoginPage from "../../../server_pages/login";

// section: component
/**
 * Test app login page
 * Uses the zero-config LoginPage server component which includes AuthPageShell internally
 */
export default function login_page() {
  return <LoginPage />;
}
