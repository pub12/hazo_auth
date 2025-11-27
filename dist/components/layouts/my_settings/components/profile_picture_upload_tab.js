// file_description: Upload tab component for profile picture dialog with dropzone and preview
// section: client_directive
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// section: imports
import { useState, useCallback, useEffect } from "react";
import { Switch } from "../../../ui/switch";
import { Label } from "../../../ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "../../../ui/avatar";
import { Upload, X, Loader2, Info } from "lucide-react";
import { Button } from "../../../ui/button";
import imageCompression from "browser-image-compression";
// section: component
/**
 * Upload tab component for profile picture dialog
 * Two columns: left = dropzone, right = preview
 * Uses browser-image-compression for client-side compression
 * @param props - Component props including upload state, file handler, and configuration
 * @returns Upload tab component
 */
export function ProfilePictureUploadTab({ useUpload, onUseUploadChange, onFileSelect, maxSize, uploadEnabled, disabled = false, currentPreview, photoUploadDisabledMessage, imageCompressionMaxDimension = 200, uploadFileHardLimitBytes = 10485760, // 10MB default
allowedImageMimeTypes = ["image/jpeg", "image/jpg", "image/png"], }) {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(currentPreview || null);
    const [isNewImage, setIsNewImage] = useState(false); // Track if preview is showing a newly uploaded image
    const [uploading, setUploading] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [error, setError] = useState(null);
    // Update preview when currentPreview changes (e.g., when dialog opens)
    useEffect(() => {
        if (currentPreview) {
            setPreview(currentPreview);
            setIsNewImage(false); // Reset to current when dialog opens or currentPreview changes
        }
        else {
            // If no current preview, only clear if we're not showing a new image
            if (!isNewImage) {
                setPreview(null);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPreview]); // Only depend on currentPreview to avoid loops, isNewImage check is intentional
    const handleFile = useCallback(async (file) => {
        // Validate file type
        if (!allowedImageMimeTypes.includes(file.type)) {
            setError(`Invalid file type. Only ${allowedImageMimeTypes.map(t => t.split("/")[1].toUpperCase()).join(", ")} files are allowed.`);
            return;
        }
        // Hard limit: reject files larger than configured limit (too large to process efficiently)
        if (file.size > uploadFileHardLimitBytes) {
            setError(`File is too large. Maximum size is ${Math.round(maxSize / 1024)}KB.`);
            return;
        }
        setError(null);
        setCompressing(false);
        setUploading(false);
        // If file is larger than maxSize, compress it
        if (file.size > maxSize) {
            setCompressing(true);
            try {
                // Compress image
                const options = {
                    maxSizeMB: maxSize / (1024 * 1024), // Convert bytes to MB
                    maxWidthOrHeight: imageCompressionMaxDimension,
                    useWebWorker: true,
                    fileType: file.type,
                };
                const compressedFile = await imageCompression(file, options);
                setCompressing(false);
                // Check if compressed file is still too large
                if (compressedFile.size > maxSize) {
                    setError(`File is too large. Maximum size is ${Math.round(maxSize / 1024)}KB. After compression, file is ${Math.round(compressedFile.size / 1024)}KB.`);
                    return;
                }
                // Create preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                    setIsNewImage(true); // Mark as new image
                };
                reader.readAsDataURL(compressedFile);
                // Upload the compressed file
                setUploading(true);
                await onFileSelect(compressedFile);
                setUploading(false);
            }
            catch (error) {
                setCompressing(false);
                const errorMessage = error instanceof Error ? error.message : "Failed to compress image";
                setError(errorMessage);
            }
        }
        else {
            // File is already small enough, just upload it
            setUploading(true);
            try {
                // Create preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                    setIsNewImage(true); // Mark as new image
                };
                reader.readAsDataURL(file);
                // Call onFileSelect with original file
                await onFileSelect(file);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Failed to process image";
                setError(errorMessage);
            }
            finally {
                setUploading(false);
            }
        }
    }, [maxSize, onFileSelect]);
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        }
        else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (!uploadEnabled || disabled) {
            setError("Photo upload is not enabled");
            return;
        }
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            void handleFile(e.dataTransfer.files[0]);
        }
    }, [uploadEnabled, disabled, handleFile]);
    const handleChange = useCallback((e) => {
        e.preventDefault();
        if (!uploadEnabled || disabled) {
            setError("Photo upload is not enabled");
            return;
        }
        if (e.target.files && e.target.files[0]) {
            void handleFile(e.target.files[0]);
        }
    }, [uploadEnabled, disabled, handleFile]);
    const handleRemove = useCallback(() => {
        setPreview(currentPreview || null); // Reset to current preview if available
        setIsNewImage(false); // Reset to showing current image
        setError(null);
    }, [currentPreview]);
    const getInitials = () => {
        return "U";
    };
    return (_jsxs("div", { className: "cls_profile_picture_upload_tab flex flex-col gap-4", children: [_jsxs("div", { className: "cls_profile_picture_upload_tab_switch flex items-center gap-3", children: [_jsx(Switch, { id: "use-upload", checked: useUpload, onCheckedChange: onUseUploadChange, disabled: disabled || !uploadEnabled, className: "cls_profile_picture_upload_tab_switch_input", "aria-label": "Use uploaded photo" }), _jsx(Label, { htmlFor: "use-upload", className: "cls_profile_picture_upload_tab_switch_label text-sm font-medium text-[var(--hazo-text-secondary)] cursor-pointer", children: "Use uploaded photo" })] }), !uploadEnabled && (_jsxs("div", { className: "cls_profile_picture_upload_tab_disabled flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg", children: [_jsx(Info, { className: "h-4 w-4 text-yellow-600", "aria-hidden": "true" }), _jsx("p", { className: "cls_profile_picture_upload_tab_disabled_text text-sm text-yellow-800", children: photoUploadDisabledMessage })] })), _jsxs("div", { className: "cls_profile_picture_upload_tab_content grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "cls_profile_picture_upload_tab_dropzone_container flex flex-col gap-2", children: [_jsx(Label, { className: "cls_profile_picture_upload_tab_dropzone_label text-sm font-medium text-[var(--hazo-text-secondary)]", children: "Upload Photo" }), _jsxs("div", { className: `
              cls_profile_picture_upload_tab_dropzone
              flex flex-col items-center justify-center
              border-2 border-dashed rounded-lg p-8
              transition-colors
              ${dragActive ? "border-blue-500 bg-blue-50" : "border-[var(--hazo-border-emphasis)] bg-[var(--hazo-bg-subtle)]"}
              ${disabled || !uploadEnabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-[var(--hazo-border-emphasis)]"}
            `, onDragEnter: handleDrag, onDragLeave: handleDrag, onDragOver: handleDrag, onDrop: handleDrop, onClick: () => {
                                    var _a;
                                    if (!disabled && uploadEnabled) {
                                        (_a = document.getElementById("file-upload-input")) === null || _a === void 0 ? void 0 : _a.click();
                                    }
                                }, children: [_jsx("input", { id: "file-upload-input", type: "file", accept: allowedImageMimeTypes.join(","), onChange: handleChange, disabled: disabled || !uploadEnabled, className: "hidden", "aria-label": "Upload profile picture" }), _jsx(Upload, { className: "h-8 w-8 text-[var(--hazo-text-subtle)] mb-2", "aria-hidden": "true" }), _jsx("p", { className: "cls_profile_picture_upload_tab_dropzone_text text-sm text-[var(--hazo-text-muted)] text-center", children: "Drag and drop an image here, or click to select" }), _jsxs("p", { className: "cls_profile_picture_upload_tab_dropzone_hint text-xs text-[var(--hazo-text-muted)] text-center mt-1", children: ["JPG or PNG, max ", Math.round(maxSize / 1024), "KB"] })] }), error && (_jsx("p", { className: "cls_profile_picture_upload_tab_error text-sm text-red-600", role: "alert", children: error }))] }), _jsxs("div", { className: "cls_profile_picture_upload_tab_preview_container flex flex-col gap-2", children: [_jsx(Label, { className: "cls_profile_picture_upload_tab_preview_label text-sm font-medium text-[var(--hazo-text-secondary)]", children: isNewImage ? "Preview (new)" : "Preview (current)" }), _jsx("div", { className: "cls_profile_picture_upload_tab_preview_content flex flex-col items-center justify-center border border-[var(--hazo-border)] rounded-lg p-6 bg-[var(--hazo-bg-subtle)] min-h-[200px]", children: compressing ? (_jsxs("div", { className: "cls_profile_picture_upload_tab_compressing flex flex-col items-center gap-2", children: [_jsx(Loader2, { className: "h-8 w-8 text-[var(--hazo-text-subtle)] animate-spin", "aria-hidden": "true" }), _jsx("p", { className: "cls_profile_picture_upload_tab_compressing_text text-sm text-[var(--hazo-text-muted)]", children: "Compressing image..." })] })) : uploading ? (_jsxs("div", { className: "cls_profile_picture_upload_tab_uploading flex flex-col items-center gap-2", children: [_jsx(Loader2, { className: "h-8 w-8 text-[var(--hazo-text-subtle)] animate-spin", "aria-hidden": "true" }), _jsx("p", { className: "cls_profile_picture_upload_tab_uploading_text text-sm text-[var(--hazo-text-muted)]", children: "Uploading..." })] })) : preview ? (_jsxs("div", { className: "cls_profile_picture_upload_tab_preview_image_container flex flex-col items-center gap-4", children: [_jsxs("div", { className: "cls_profile_picture_upload_tab_preview_image_wrapper relative", children: [_jsxs(Avatar, { className: "cls_profile_picture_upload_tab_preview_avatar h-32 w-32", children: [_jsx(AvatarImage, { src: preview, alt: "Uploaded profile picture preview", className: "cls_profile_picture_upload_tab_preview_avatar_image" }), _jsx(AvatarFallback, { className: "cls_profile_picture_upload_tab_preview_avatar_fallback bg-[var(--hazo-bg-emphasis)] text-[var(--hazo-text-muted)] text-3xl", children: getInitials() })] }), _jsx(Button, { type: "button", onClick: handleRemove, variant: "ghost", size: "icon", className: "cls_profile_picture_upload_tab_preview_remove absolute -top-2 -right-2 rounded-full h-6 w-6 border border-[var(--hazo-border-emphasis)] bg-white hover:bg-[var(--hazo-bg-subtle)]", "aria-label": "Remove preview", children: _jsx(X, { className: "h-4 w-4", "aria-hidden": "true" }) })] }), _jsx("p", { className: "cls_profile_picture_upload_tab_preview_success_text text-sm text-[var(--hazo-text-muted)] text-center", children: "Preview of your uploaded photo" })] })) : (_jsxs("div", { className: "cls_profile_picture_upload_tab_preview_empty flex flex-col items-center gap-2", children: [_jsx(Avatar, { className: "cls_profile_picture_upload_tab_preview_empty_avatar h-32 w-32", children: _jsx(AvatarFallback, { className: "cls_profile_picture_upload_tab_preview_empty_avatar_fallback bg-[var(--hazo-bg-emphasis)] text-[var(--hazo-text-muted)] text-3xl", children: getInitials() }) }), _jsx("p", { className: "cls_profile_picture_upload_tab_preview_empty_text text-sm text-[var(--hazo-text-muted)] text-center", children: "Upload an image to see preview" })] })) })] })] })] }));
}
