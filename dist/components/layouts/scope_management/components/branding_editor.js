// file_description: Branding editor component for managing firm branding (logo, colors, tagline)
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// section: imports
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "../../../ui/button.js";
import { Input } from "../../../ui/input.js";
import { Label } from "../../../ui/label.js";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "../../../ui/dialog.js";
import { Loader2, Upload, Trash2, CircleCheck, CircleX, Image as ImageIcon, Palette, } from "lucide-react";
import { toast } from "sonner";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider.js";
// section: helpers
function isValidHexColor(color) {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
}
// section: component
export function BrandingEditor({ scopeId, scopeName, isOpen, onClose, onSave, initialBranding, }) {
    const { apiBasePath } = useHazoAuthConfig();
    // State
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    // Form state
    const [logoUrl, setLogoUrl] = useState((initialBranding === null || initialBranding === void 0 ? void 0 : initialBranding.logo_url) || "");
    const [primaryColor, setPrimaryColor] = useState((initialBranding === null || initialBranding === void 0 ? void 0 : initialBranding.primary_color) || "");
    const [secondaryColor, setSecondaryColor] = useState((initialBranding === null || initialBranding === void 0 ? void 0 : initialBranding.secondary_color) || "");
    const [tagline, setTagline] = useState((initialBranding === null || initialBranding === void 0 ? void 0 : initialBranding.tagline) || "");
    // File input ref
    const fileInputRef = useRef(null);
    // Load current branding when dialog opens
    useEffect(() => {
        if (isOpen && scopeId) {
            loadBranding();
        }
    }, [isOpen, scopeId]);
    // Load branding from API
    const loadBranding = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                scope_id: scopeId,
                resolve_inheritance: "false", // Get the scope's own branding, not inherited
            });
            const response = await fetch(`${apiBasePath}/scope_management/branding?${params}`);
            const data = await response.json();
            if (data.success) {
                const branding = data.branding || {};
                setLogoUrl(branding.logo_url || "");
                setPrimaryColor(branding.primary_color || "");
                setSecondaryColor(branding.secondary_color || "");
                setTagline(branding.tagline || "");
            }
        }
        catch (error) {
            toast.error("Failed to load branding");
        }
        finally {
            setLoading(false);
        }
    }, [apiBasePath, scopeId]);
    // Handle logo file upload
    const handleLogoUpload = async (file) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("scope_id", scopeId);
            formData.append("file", file);
            const response = await fetch(`${apiBasePath}/scope_management/branding/logo`, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (data.success) {
                setLogoUrl(data.logo_url);
                toast.success("Logo uploaded successfully");
            }
            else {
                toast.error(data.error || "Failed to upload logo");
            }
        }
        catch (error) {
            toast.error("Failed to upload logo");
        }
        finally {
            setUploading(false);
        }
    };
    // Handle file input change
    const handleFileChange = (e) => {
        var _a;
        const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            handleLogoUpload(file);
        }
    };
    // Trigger file input click
    const handleUploadClick = () => {
        var _a;
        (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click();
    };
    // Handle save branding
    const handleSave = async () => {
        // Validate colors
        if (primaryColor && !isValidHexColor(primaryColor)) {
            toast.error("Invalid primary color format (use #RRGGBB)");
            return;
        }
        if (secondaryColor && !isValidHexColor(secondaryColor)) {
            toast.error("Invalid secondary color format (use #RRGGBB)");
            return;
        }
        setSaving(true);
        try {
            const branding = {};
            if (logoUrl)
                branding.logo_url = logoUrl;
            if (primaryColor)
                branding.primary_color = primaryColor;
            if (secondaryColor)
                branding.secondary_color = secondaryColor;
            if (tagline)
                branding.tagline = tagline;
            const hasValues = Object.keys(branding).length > 0;
            const response = await fetch(`${apiBasePath}/scope_management/branding`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scope_id: scopeId,
                    branding: hasValues ? branding : null,
                }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Branding saved successfully");
                onSave === null || onSave === void 0 ? void 0 : onSave(hasValues ? branding : null);
                onClose();
            }
            else {
                toast.error(data.error || "Failed to save branding");
            }
        }
        catch (error) {
            toast.error("Failed to save branding");
        }
        finally {
            setSaving(false);
        }
    };
    // Handle clear branding
    const handleClear = async () => {
        setSaving(true);
        try {
            const params = new URLSearchParams({ scope_id: scopeId });
            const response = await fetch(`${apiBasePath}/scope_management/branding?${params}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (data.success) {
                setLogoUrl("");
                setPrimaryColor("");
                setSecondaryColor("");
                setTagline("");
                toast.success("Branding cleared");
                onSave === null || onSave === void 0 ? void 0 : onSave(null);
            }
            else {
                toast.error(data.error || "Failed to clear branding");
            }
        }
        catch (error) {
            toast.error("Failed to clear branding");
        }
        finally {
            setSaving(false);
        }
    };
    // Remove logo
    const handleRemoveLogo = () => {
        setLogoUrl("");
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: (open) => !open && onClose(), children: _jsxs(DialogContent, { className: "cls_branding_editor_dialog max-w-lg", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(Palette, { className: "h-5 w-5" }), "Firm Branding"] }), _jsxs(DialogDescription, { children: ["Customize branding for \"", scopeName, "\""] })] }), loading ? (_jsx("div", { className: "flex items-center justify-center p-8", children: _jsx(Loader2, { className: "h-6 w-6 animate-spin text-slate-400" }) })) : (_jsxs("div", { className: "flex flex-col gap-6 py-4", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { children: "Logo" }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "flex-shrink-0 w-24 h-24 border rounded-lg overflow-hidden bg-muted flex items-center justify-center", children: logoUrl ? (_jsx("img", { src: logoUrl, alt: "Firm logo", className: "w-full h-full object-contain" })) : (_jsx(ImageIcon, { className: "h-8 w-8 text-muted-foreground" })) }), _jsxs("div", { className: "flex flex-col gap-2 flex-1", children: [_jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileChange, accept: "image/png,image/jpeg,image/svg+xml,image/webp", className: "hidden" }), _jsx(Button, { type: "button", variant: "outline", size: "sm", onClick: handleUploadClick, disabled: uploading, children: uploading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Uploading..."] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), "Upload Logo"] })) }), logoUrl && (_jsxs(Button, { type: "button", variant: "ghost", size: "sm", onClick: handleRemoveLogo, className: "text-destructive hover:text-destructive", children: [_jsx(Trash2, { className: "h-4 w-4 mr-2" }), "Remove"] })), _jsx("p", { className: "text-xs text-muted-foreground", children: "PNG, JPG, SVG or WebP. Max 500KB." })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { htmlFor: "primary_color", children: "Primary Color" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { id: "primary_color", type: "text", value: primaryColor, onChange: (e) => setPrimaryColor(e.target.value), placeholder: "#1a73e8", className: "flex-1" }), _jsx("input", { type: "color", value: primaryColor || "#000000", onChange: (e) => setPrimaryColor(e.target.value), className: "w-10 h-10 rounded border cursor-pointer", title: "Pick color" })] })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { htmlFor: "secondary_color", children: "Secondary Color" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { id: "secondary_color", type: "text", value: secondaryColor, onChange: (e) => setSecondaryColor(e.target.value), placeholder: "#4285f4", className: "flex-1" }), _jsx("input", { type: "color", value: secondaryColor || "#000000", onChange: (e) => setSecondaryColor(e.target.value), className: "w-10 h-10 rounded border cursor-pointer", title: "Pick color" })] })] })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { htmlFor: "tagline", children: "Tagline" }), _jsx(Input, { id: "tagline", type: "text", value: tagline, onChange: (e) => setTagline(e.target.value), placeholder: "Your trusted partner", maxLength: 200 }), _jsx("p", { className: "text-xs text-muted-foreground", children: "A short company tagline (max 200 characters)" })] }), (logoUrl || primaryColor || tagline) && (_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Label, { children: "Preview" }), _jsx("div", { className: "p-4 rounded-lg border", style: {
                                        backgroundColor: primaryColor
                                            ? `${primaryColor}10`
                                            : undefined,
                                        borderColor: primaryColor || undefined,
                                    }, children: _jsxs("div", { className: "flex items-center gap-3", children: [logoUrl && (_jsx("img", { src: logoUrl, alt: "Logo preview", className: "h-10 w-10 object-contain" })), _jsxs("div", { children: [_jsx("div", { className: "font-semibold", style: { color: primaryColor || undefined }, children: scopeName }), tagline && (_jsx("div", { className: "text-sm", style: { color: secondaryColor || undefined }, children: tagline }))] })] }) })] }))] })), _jsxs(DialogFooter, { className: "flex gap-2 sm:gap-0", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: handleClear, disabled: saving || loading, className: "text-destructive hover:text-destructive", children: [_jsx(Trash2, { className: "h-4 w-4 mr-2" }), "Clear All"] }), _jsx("div", { className: "flex-1" }), _jsxs(Button, { variant: "outline", onClick: onClose, disabled: saving, children: [_jsx(CircleX, { className: "h-4 w-4 mr-2" }), "Cancel"] }), _jsx(Button, { onClick: handleSave, disabled: saving || loading, children: saving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Saving..."] })) : (_jsxs(_Fragment, { children: [_jsx(CircleCheck, { className: "h-4 w-4 mr-2" }), "Save"] })) })] })] }) }));
}
