// file_description: zero-config dev lock page component for hazo_auth
// Consumers can use this directly without needing to configure props
"use client";
import { jsx as _jsx } from "react/jsx-runtime";
// section: imports
import DevLockLayout from "../components/layouts/dev_lock";
// section: component
/**
 * Zero-config dev lock page component
 * Uses sensible defaults and can be customized via props
 * @param props - Optional configuration overrides
 * @returns Dev lock page component
 */
export function DevLockPage(props = {}) {
    return _jsx(DevLockLayout, Object.assign({}, props));
}
export default DevLockPage;
