// file_description: Upload tab component for profile picture dialog with dropzone and preview
// section: client_directive
"use client";

// section: imports
import { useState, useCallback, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Upload, X, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import imageCompression from "browser-image-compression";

// section: types
export type ProfilePictureUploadTabProps = {
  useUpload: boolean;
  onUseUploadChange: (use: boolean) => void;
  onFileSelect: (file: File) => Promise<void>;
  maxSize: number; // in bytes
  uploadEnabled: boolean;
  disabled?: boolean;
  currentPreview?: string;
  photoUploadDisabledMessage?: string;
  imageCompressionMaxDimension?: number;
  uploadFileHardLimitBytes?: number;
  allowedImageMimeTypes?: string[];
};

// section: component
/**
 * Upload tab component for profile picture dialog
 * Two columns: left = dropzone, right = preview
 * Uses browser-image-compression for client-side compression
 * @param props - Component props including upload state, file handler, and configuration
 * @returns Upload tab component
 */
export function ProfilePictureUploadTab({
  useUpload,
  onUseUploadChange,
  onFileSelect,
  maxSize,
  uploadEnabled,
  disabled = false,
  currentPreview,
  photoUploadDisabledMessage,
  imageCompressionMaxDimension = 200,
  uploadFileHardLimitBytes = 10485760, // 10MB default
  allowedImageMimeTypes = ["image/jpeg", "image/jpg", "image/png"],
}: ProfilePictureUploadTabProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPreview || null);
  const [isNewImage, setIsNewImage] = useState(false); // Track if preview is showing a newly uploaded image
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update preview when currentPreview changes (e.g., when dialog opens)
  useEffect(() => {
    if (currentPreview) {
      setPreview(currentPreview);
      setIsNewImage(false); // Reset to current when dialog opens or currentPreview changes
    } else {
      // If no current preview, only clear if we're not showing a new image
      if (!isNewImage) {
        setPreview(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPreview]); // Only depend on currentPreview to avoid loops, isNewImage check is intentional

  const handleFile = useCallback(async (file: File) => {
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
          setPreview(reader.result as string);
          setIsNewImage(true); // Mark as new image
        };
        reader.readAsDataURL(compressedFile);

        // Upload the compressed file
        setUploading(true);
        await onFileSelect(compressedFile);
        setUploading(false);
      } catch (error) {
        setCompressing(false);
        const errorMessage = error instanceof Error ? error.message : "Failed to compress image";
        setError(errorMessage);
      }
    } else {
      // File is already small enough, just upload it
      setUploading(true);
      try {
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
          setIsNewImage(true); // Mark as new image
        };
        reader.readAsDataURL(file);

        // Call onFileSelect with original file
        await onFileSelect(file);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to process image";
        setError(errorMessage);
      } finally {
        setUploading(false);
      }
    }
  }, [maxSize, onFileSelect]);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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

  const getInitials = (): string => {
    return "U";
  };

  return (
    <div className="cls_profile_picture_upload_tab flex flex-col gap-4">
      {/* Switch */}
      <div className="cls_profile_picture_upload_tab_switch flex items-center gap-3">
        <Switch
          id="use-upload"
          checked={useUpload}
          onCheckedChange={onUseUploadChange}
          disabled={disabled || !uploadEnabled}
          className="cls_profile_picture_upload_tab_switch_input"
          aria-label="Use uploaded photo"
        />
        <Label
          htmlFor="use-upload"
          className="cls_profile_picture_upload_tab_switch_label text-sm font-medium text-slate-700 cursor-pointer"
        >
          Use uploaded photo
        </Label>
      </div>

      {!uploadEnabled && (
        <div className="cls_profile_picture_upload_tab_disabled flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Info className="h-4 w-4 text-yellow-600" aria-hidden="true" />
          <p className="cls_profile_picture_upload_tab_disabled_text text-sm text-yellow-800">
            {photoUploadDisabledMessage}
          </p>
        </div>
      )}

      {/* Two columns: dropzone and preview */}
      <div className="cls_profile_picture_upload_tab_content grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Dropzone */}
        <div className="cls_profile_picture_upload_tab_dropzone_container flex flex-col gap-2">
          <Label className="cls_profile_picture_upload_tab_dropzone_label text-sm font-medium text-slate-700">
            Upload Photo
          </Label>
          <div
            className={`
              cls_profile_picture_upload_tab_dropzone
              flex flex-col items-center justify-center
              border-2 border-dashed rounded-lg p-8
              transition-colors
              ${dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50"}
              ${disabled || !uploadEnabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-slate-400"}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => {
              if (!disabled && uploadEnabled) {
                document.getElementById("file-upload-input")?.click();
              }
            }}
          >
            <input
              id="file-upload-input"
              type="file"
              accept={allowedImageMimeTypes.join(",")}
              onChange={handleChange}
              disabled={disabled || !uploadEnabled}
              className="hidden"
              aria-label="Upload profile picture"
            />
            <Upload className="h-8 w-8 text-slate-400 mb-2" aria-hidden="true" />
            <p className="cls_profile_picture_upload_tab_dropzone_text text-sm text-slate-600 text-center">
              Drag and drop an image here, or click to select
            </p>
            <p className="cls_profile_picture_upload_tab_dropzone_hint text-xs text-slate-500 text-center mt-1">
              JPG or PNG, max {Math.round(maxSize / 1024)}KB
            </p>
          </div>
          {error && (
            <p className="cls_profile_picture_upload_tab_error text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Right column: Preview */}
        <div className="cls_profile_picture_upload_tab_preview_container flex flex-col gap-2">
          <Label className="cls_profile_picture_upload_tab_preview_label text-sm font-medium text-slate-700">
            {isNewImage ? "Preview (new)" : "Preview (current)"}
          </Label>
          <div className="cls_profile_picture_upload_tab_preview_content flex flex-col items-center justify-center border border-slate-200 rounded-lg p-6 bg-slate-50 min-h-[200px]">
            {compressing ? (
              <div className="cls_profile_picture_upload_tab_compressing flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-slate-400 animate-spin" aria-hidden="true" />
                <p className="cls_profile_picture_upload_tab_compressing_text text-sm text-slate-600">
                  Compressing image...
                </p>
              </div>
            ) : uploading ? (
              <div className="cls_profile_picture_upload_tab_uploading flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-slate-400 animate-spin" aria-hidden="true" />
                <p className="cls_profile_picture_upload_tab_uploading_text text-sm text-slate-600">
                  Uploading...
                </p>
              </div>
            ) : preview ? (
              <div className="cls_profile_picture_upload_tab_preview_image_container flex flex-col items-center gap-4">
                <div className="cls_profile_picture_upload_tab_preview_image_wrapper relative">
                  <Avatar className="cls_profile_picture_upload_tab_preview_avatar h-32 w-32">
                    <AvatarImage
                      src={preview}
                      alt="Uploaded profile picture preview"
                      className="cls_profile_picture_upload_tab_preview_avatar_image"
                    />
                    <AvatarFallback className="cls_profile_picture_upload_tab_preview_avatar_fallback bg-slate-200 text-slate-600 text-3xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    onClick={handleRemove}
                    variant="ghost"
                    size="icon"
                    className="cls_profile_picture_upload_tab_preview_remove absolute -top-2 -right-2 rounded-full h-6 w-6 border border-slate-300 bg-white hover:bg-slate-50"
                    aria-label="Remove preview"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
                <p className="cls_profile_picture_upload_tab_preview_success_text text-sm text-slate-600 text-center">
                  Preview of your uploaded photo
                </p>
              </div>
            ) : (
              <div className="cls_profile_picture_upload_tab_preview_empty flex flex-col items-center gap-2">
                <Avatar className="cls_profile_picture_upload_tab_preview_empty_avatar h-32 w-32">
                  <AvatarFallback className="cls_profile_picture_upload_tab_preview_empty_avatar_fallback bg-slate-200 text-slate-600 text-3xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <p className="cls_profile_picture_upload_tab_preview_empty_text text-sm text-slate-500 text-center">
                  Upload an image to see preview
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

