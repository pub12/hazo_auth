// file_description: Test page layout for ProfileStamp component demonstrating various scenarios
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// section: imports
import { useState } from "react";
import { ProfileStamp } from "../shared/components/profile_stamp";
import { use_auth_status } from "../shared/hooks/use_auth_status";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
// section: component
/**
 * ProfileStampTestLayout - Test page for ProfileStamp component
 * Demonstrates various scenarios and configurations
 */
export function ProfileStampTestLayout({ className }) {
    const authStatus = use_auth_status();
    const [showCustomFields, setShowCustomFields] = useState(true);
    // Sample custom fields for testing
    const sampleCustomFields = [
        { label: "Role", value: "Administrator" },
        { label: "Department", value: "Engineering" },
        { label: "Joined", value: "Jan 2024" },
    ];
    return (_jsxs("div", { className: `cls_profile_stamp_test_layout w-full max-w-4xl mx-auto p-6 ${className || ""}`, children: [_jsx("h1", { className: "text-2xl font-bold mb-6", children: "ProfileStamp Component Test" }), _jsxs(Card, { className: "p-4 mb-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-2", children: "Current Auth Status" }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [_jsx("div", { children: "Authenticated:" }), _jsx("div", { className: authStatus.authenticated ? "text-green-600" : "text-red-600", children: authStatus.authenticated ? "Yes" : "No" }), _jsx("div", { children: "User ID:" }), _jsx("div", { children: authStatus.user_id || "N/A" }), _jsx("div", { children: "Name:" }), _jsx("div", { children: authStatus.name || "N/A" }), _jsx("div", { children: "Email:" }), _jsx("div", { children: authStatus.email || "N/A" }), _jsx("div", { children: "Profile Picture URL:" }), _jsx("div", { className: "truncate", children: authStatus.profile_picture_url || "N/A" }), _jsx("div", { children: "Profile Source:" }), _jsx("div", { children: authStatus.profile_source || "N/A" })] })] }), _jsxs(Card, { className: "p-4 mb-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Size Variants" }), _jsxs("div", { className: "flex items-end gap-6", children: [_jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx(ProfileStamp, { size: "sm" }), _jsx("span", { className: "text-xs text-muted-foreground", children: "sm (24px)" })] }), _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx(ProfileStamp, { size: "default" }), _jsx("span", { className: "text-xs text-muted-foreground", children: "default (32px)" })] }), _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx(ProfileStamp, { size: "lg" }), _jsx("span", { className: "text-xs text-muted-foreground", children: "lg (40px)" })] })] })] }), _jsxs(Card, { className: "p-4 mb-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "With Custom Fields" }), _jsx("div", { className: "flex items-center gap-4 mb-4", children: _jsx(Button, { variant: showCustomFields ? "default" : "outline", size: "sm", onClick: () => setShowCustomFields(!showCustomFields), children: showCustomFields ? "Hide Custom Fields" : "Show Custom Fields" }) }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(ProfileStamp, { size: "lg", custom_fields: showCustomFields ? sampleCustomFields : [] }), _jsxs("span", { className: "text-sm text-muted-foreground", children: ["Hover to see ", showCustomFields ? "name, email, and custom fields" : "name and email only"] })] }), showCustomFields && (_jsx("div", { className: "mt-4 p-3 bg-muted rounded-md", children: _jsxs("div", { className: "text-xs font-mono", children: ["custom_fields=", JSON.stringify(sampleCustomFields, null, 2)] }) }))] }), _jsxs(Card, { className: "p-4 mb-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Display Options" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(ProfileStamp, { show_name: true, show_email: true }), _jsx("span", { className: "text-sm text-muted-foreground", children: "show_name=true, show_email=true (default)" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(ProfileStamp, { show_name: true, show_email: false }), _jsx("span", { className: "text-sm text-muted-foreground", children: "show_name=true, show_email=false" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(ProfileStamp, { show_name: false, show_email: true }), _jsx("span", { className: "text-sm text-muted-foreground", children: "show_name=false, show_email=true" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(ProfileStamp, { show_name: false, show_email: false }), _jsx("span", { className: "text-sm text-muted-foreground", children: "show_name=false, show_email=false (no hover card)" })] })] })] }), _jsxs(Card, { className: "p-4 mb-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Inline Usage Example (Note Attribution)" }), _jsx("div", { className: "border rounded-lg p-4 bg-background", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(ProfileStamp, { size: "default" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "font-medium text-sm", children: authStatus.name || "User" }), _jsx("span", { className: "text-xs text-muted-foreground", children: "2 hours ago" })] }), _jsx("p", { className: "text-sm text-foreground", children: "This is an example note with a ProfileStamp component showing who added it. Hover over the profile picture to see more details about the user." })] })] }) })] }), _jsxs(Card, { className: "p-4 mb-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Comment Thread Example" }), _jsx("div", { className: "space-y-4", children: [
                            { time: "3 hours ago", text: "Great progress on the project!" },
                            { time: "2 hours ago", text: "I agree, the new features look amazing." },
                            { time: "1 hour ago", text: "Let me know if you need any help with the deployment." },
                        ].map((comment, index) => (_jsxs("div", { className: "flex items-start gap-3 border-b pb-4 last:border-b-0", children: [_jsx(ProfileStamp, { size: "sm", custom_fields: [{ label: "Comment", value: `#${index + 1}` }] }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "font-medium text-sm", children: authStatus.name || "User" }), _jsx("span", { className: "text-xs text-muted-foreground", children: comment.time })] }), _jsx("p", { className: "text-sm text-foreground", children: comment.text })] })] }, index))) })] }), _jsxs(Card, { className: "p-4 mb-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "API Response Fields" }), _jsx("p", { className: "text-sm text-muted-foreground mb-3", children: "The /api/hazo_auth/me endpoint now returns these profile picture fields:" }), _jsx("div", { className: "p-3 bg-muted rounded-md font-mono text-xs", children: _jsx("pre", { children: `{
  "profile_picture_url": "${authStatus.profile_picture_url || "null"}",
  "profile_image": "${authStatus.profile_image || "null"}",     // alias
  "avatar_url": "${authStatus.avatar_url || "null"}",           // alias
  "image": "${authStatus.image || "null"}"                      // alias
}` }) })] }), _jsxs(Card, { className: "p-4", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Usage Code Example" }), _jsx("div", { className: "p-3 bg-muted rounded-md font-mono text-xs overflow-x-auto", children: _jsx("pre", { children: `// Basic usage
import { ProfileStamp } from "hazo_auth/client";

<ProfileStamp />

// With all options
<ProfileStamp
  size="lg"
  show_name={true}
  show_email={true}
  custom_fields={[
    { label: "Role", value: "Admin" },
    { label: "Department", value: "IT" }
  ]}
  className="my-custom-class"
/>` }) })] })] }));
}
export default ProfileStampTestLayout;
