export type DevLockLayoutProps = {
    /** Background color (default: #000000 - black) */
    background_color?: string;
    /** Logo image path (empty = no logo shown, configure to show) */
    logo_path?: string;
    /** Logo width in pixels (default: 120) */
    logo_width?: number;
    /** Logo height in pixels (default: 120) */
    logo_height?: number;
    /** Application name displayed below logo */
    application_name?: string;
    /** Limited access text displayed with lock icon (default: "Limited Access") */
    limited_access_text?: string;
    /** Password input placeholder (default: "Enter access password") */
    password_placeholder?: string;
    /** Submit button text (default: "Unlock") */
    submit_button_text?: string;
    /** Error message for incorrect password (default: "Incorrect password") */
    error_message?: string;
    /** Text color for labels (default: #ffffff - white) */
    text_color?: string;
    /** Accent color for button (default: #3b82f6 - blue) */
    accent_color?: string;
    /** Callback when unlock is successful */
    onUnlock?: () => void;
};
export default function DevLockLayout({ background_color, logo_path, logo_width, logo_height, application_name, limited_access_text, password_placeholder, submit_button_text, error_message, text_color, accent_color, onUnlock, }: DevLockLayoutProps): import("react/jsx-runtime").JSX.Element;
export { DevLockLayout };
//# sourceMappingURL=index.d.ts.map