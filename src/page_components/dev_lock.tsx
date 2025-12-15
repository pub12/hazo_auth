// file_description: zero-config dev lock page component for hazo_auth
// Consumers can use this directly without needing to configure props
"use client";

// section: imports
import DevLockLayout from "../components/layouts/dev_lock";
import type { DevLockLayoutProps } from "../components/layouts/dev_lock";

// section: types
export type DevLockPageProps = DevLockLayoutProps;

// section: component
/**
 * Zero-config dev lock page component
 * Uses sensible defaults and can be customized via props
 * @param props - Optional configuration overrides
 * @returns Dev lock page component
 */
export function DevLockPage(props: DevLockPageProps = {}) {
  return <DevLockLayout {...props} />;
}

export default DevLockPage;
