// file_description: profile picture dialog component with tabs for Upload, Library, and Gravatar
// section: client_directive
"use client";

// section: imports
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfilePictureUploadTab } from "./profile_picture_upload_tab";
import { ProfilePictureLibraryTab } from "./profile_picture_library_tab";
import { ProfilePictureGravatarTab } from "./profile_picture_gravatar_tab";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// section: types
export type ProfilePictureDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (profilePictureUrl: string, profileSource: "upload" | "library" | "gravatar") => Promise<void>;
  email: string;
  allowPhotoUpload: boolean;
  maxPhotoSize: number; // in bytes
  libraryPhotoPath: string;
  currentProfilePictureUrl?: string;
  currentProfileSource?: "upload" | "library" | "gravatar" | "custom";
  saveButtonLabel?: string;
  cancelButtonLabel?: string;
  disabled?: boolean;
  messages: {
    photo_upload_disabled_message: string;
    gravatar_setup_message: string;
    gravatar_no_account_message: string;
    library_tooltip_message: string;
  };
  uiSizes: {
    gravatar_size: number;
    profile_picture_size: number;
    tooltip_icon_size_default: number;
    tooltip_icon_size_small: number;
    library_photo_grid_columns: number;
    library_photo_preview_size: number;
    image_compression_max_dimension: number;
    upload_file_hard_limit_bytes: number;
  };
  fileTypes: {
    allowed_image_extensions: string[];
    allowed_image_mime_types: string[];
  };
};

// section: component
/**
 * Profile picture dialog component with tabs for Upload, Library, and Gravatar
 * Only one switch can be active at a time
 * @param props - Component props including open state, save handler, and configuration
 * @returns Profile picture dialog component
 */
export function ProfilePictureDialog({
  open,
  onOpenChange,
  onSave,
  email,
  allowPhotoUpload,
  maxPhotoSize,
  libraryPhotoPath,
  currentProfilePictureUrl,
  currentProfileSource,
  saveButtonLabel = "Save",
  cancelButtonLabel = "Cancel",
  disabled = false,
  messages,
  uiSizes,
  fileTypes,
}: ProfilePictureDialogProps) {
  const [useUpload, setUseUpload] = useState(false);
  const [useLibrary, setUseLibrary] = useState(false);
  const [useGravatar, setUseGravatar] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<"upload" | "library" | "gravatar" | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState(allowPhotoUpload ? "upload" : "library");

  // Initialize state based on current profile picture
  useEffect(() => {
    if (open) {
      // Determine default active tab (skip upload if not enabled)
      const defaultTab = allowPhotoUpload ? "upload" : "library";
      
      // Handle current profile source (may be "upload", "library", "gravatar", or "custom")
      // "custom" should be treated as "upload" for backwards compatibility
      const normalizedSource = currentProfileSource === "custom" ? "upload" : currentProfileSource;
      
      if (normalizedSource === "upload" && allowPhotoUpload) {
        setUseUpload(true);
        setUseLibrary(false);
        setUseGravatar(false);
        setSelectedSource("upload");
        setSelectedPhotoUrl(currentProfilePictureUrl || null); // Set current image for upload tab
        setActiveTab("upload");
      } else if (normalizedSource === "library") {
        setUseUpload(false);
        setUseLibrary(true);
        setUseGravatar(false);
        setSelectedSource("library");
        setSelectedPhotoUrl(currentProfilePictureUrl || null);
        setActiveTab("library");
      } else if (normalizedSource === "gravatar") {
        setUseUpload(false);
        setUseLibrary(false);
        setUseGravatar(true);
        setSelectedSource("gravatar");
        setActiveTab("gravatar");
      } else {
        // Reset to defaults
        setUseUpload(false);
        setUseLibrary(false);
        setUseGravatar(false);
        setSelectedSource(null);
        setSelectedPhotoUrl(null);
        setUploadedFile(null);
        setActiveTab(defaultTab);
      }
    }
  }, [open, currentProfileSource, currentProfilePictureUrl, allowPhotoUpload]);

  const handleUseUploadChange = (use: boolean) => {
    if (!allowPhotoUpload) {
      return; // Prevent changes if upload is not enabled
    }
    setUseUpload(use);
    if (use) {
      setUseLibrary(false);
      setUseGravatar(false);
      setSelectedPhotoUrl(null); // Clear library photo URL when upload is selected
      setSelectedSource("upload");
    } else {
      setSelectedSource(null);
      setUploadedFile(null);
      setSelectedPhotoUrl(null);
    }
  };

  const handleUseLibraryChange = (use: boolean) => {
    setUseLibrary(use);
    if (use) {
      if (allowPhotoUpload) {
        setUseUpload(false);
        setUploadedFile(null);
      }
      setUseGravatar(false);
      setSelectedSource("library");
      // Note: selectedPhotoUrl should already be set when a photo is selected
      // If no photo is selected yet, the first photo in the category will be auto-selected
    } else {
      setSelectedSource(null);
      setSelectedPhotoUrl(null);
    }
  };

  const handleUseGravatarChange = (use: boolean) => {
    setUseGravatar(use);
    if (use) {
      if (allowPhotoUpload) {
        setUseUpload(false);
        setUploadedFile(null);
      }
      setUseLibrary(false);
      setSelectedPhotoUrl(null); // Clear library photo URL when Gravatar is selected
      setSelectedSource("gravatar");
    } else {
      setSelectedSource(null);
    }
  };

  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/auth/upload_profile_picture", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.error || "Failed to upload photo";
        toast.error(errorMessage);
        setUploadedFile(null);
        return;
      }

      setSelectedPhotoUrl(data.profile_picture_url);
      toast.success("Photo uploaded successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload photo";
      toast.error(errorMessage);
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoSelect = (photoUrl: string) => {
    setSelectedPhotoUrl(photoUrl);
    // Automatically enable library photo when a photo is selected
    if (!useLibrary) {
      handleUseLibraryChange(true);
    }
  };

  const handleSave = async () => {
    if (!selectedSource) {
      toast.error("Please select a profile picture source");
      return;
    }

    if (selectedSource === "upload" && !selectedPhotoUrl) {
      toast.error("Please upload a photo first");
      return;
    }

    if (selectedSource === "library" && !selectedPhotoUrl) {
      toast.error("Please select a photo from the library");
      return;
    }

    if (selectedSource === "gravatar") {
      // For Gravatar, generate the URL client-side using gravatar-url
      // The onSave handler will use this URL directly
      const gravatarUrlModule = await import("gravatar-url");
      const gravatarUrl = gravatarUrlModule.default(email, {
        size: 200,
        default: "identicon",
      });
      await onSave(gravatarUrl, "gravatar");
      return;
    }

    if (selectedPhotoUrl) {
      await onSave(selectedPhotoUrl, selectedSource);
    }
  };

  const handleCancel = () => {
    setUseUpload(false);
    setUseLibrary(false);
    setUseGravatar(false);
    setSelectedPhotoUrl(null);
    setSelectedSource(null);
    setUploadedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cls_profile_picture_dialog max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="cls_profile_picture_dialog_header">
          <DialogTitle className="cls_profile_picture_dialog_title">
            Change Profile Picture
          </DialogTitle>
          <DialogDescription className="cls_profile_picture_dialog_description">
            Choose how you want to set your profile picture
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="cls_profile_picture_dialog_tabs">
          <TabsList className="cls_profile_picture_dialog_tabs_list">
            {allowPhotoUpload && (
              <TabsTrigger 
                value="upload" 
                className={cn(
                  "cls_profile_picture_dialog_tabs_trigger",
                  useUpload && "!text-blue-600 font-semibold data-[state=active]:!text-blue-600"
                )}
              >
                Upload
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="library" 
              className={cn(
                "cls_profile_picture_dialog_tabs_trigger",
                useLibrary && "!text-blue-600 font-semibold data-[state=active]:!text-blue-600"
              )}
            >
              Library
            </TabsTrigger>
            <TabsTrigger 
              value="gravatar" 
              className={cn(
                "cls_profile_picture_dialog_tabs_trigger",
                useGravatar && "!text-blue-600 font-semibold data-[state=active]:!text-blue-600"
              )}
            >
              Gravatar
            </TabsTrigger>
          </TabsList>

          {allowPhotoUpload && (
            <TabsContent value="upload" className="cls_profile_picture_dialog_tabs_content">
              <ProfilePictureUploadTab
                useUpload={useUpload}
                onUseUploadChange={handleUseUploadChange}
                onFileSelect={handleFileSelect}
                maxSize={maxPhotoSize}
                uploadEnabled={allowPhotoUpload}
                disabled={disabled || uploading}
                currentPreview={currentProfilePictureUrl || selectedPhotoUrl || undefined}
                photoUploadDisabledMessage={messages.photo_upload_disabled_message}
                imageCompressionMaxDimension={uiSizes.image_compression_max_dimension}
                uploadFileHardLimitBytes={uiSizes.upload_file_hard_limit_bytes}
                allowedImageMimeTypes={fileTypes.allowed_image_mime_types}
              />
            </TabsContent>
          )}

          <TabsContent value="library" className="cls_profile_picture_dialog_tabs_content">
            <ProfilePictureLibraryTab
              useLibrary={useLibrary}
              onUseLibraryChange={handleUseLibraryChange}
              onPhotoSelect={handlePhotoSelect}
              disabled={disabled}
              libraryPhotoPath={libraryPhotoPath}
              currentPhotoUrl={selectedPhotoUrl || undefined}
              libraryTooltipMessage={messages.library_tooltip_message}
              tooltipIconSizeSmall={uiSizes.tooltip_icon_size_small}
              libraryPhotoGridColumns={uiSizes.library_photo_grid_columns}
              libraryPhotoPreviewSize={uiSizes.library_photo_preview_size}
            />
          </TabsContent>

          <TabsContent value="gravatar" className="cls_profile_picture_dialog_tabs_content">
            <ProfilePictureGravatarTab
              email={email}
              useGravatar={useGravatar}
              onUseGravatarChange={handleUseGravatarChange}
              disabled={disabled}
              gravatarSetupMessage={messages.gravatar_setup_message}
              gravatarNoAccountMessage={messages.gravatar_no_account_message}
              gravatarSize={uiSizes.gravatar_size}
            />
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="cls_profile_picture_dialog_actions flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            onClick={handleSave}
            disabled={disabled || uploading || !selectedSource}
            className="cls_profile_picture_dialog_save_button"
            aria-label={saveButtonLabel}
          >
            {saveButtonLabel}
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            disabled={disabled || uploading}
            variant="outline"
            className="cls_profile_picture_dialog_cancel_button"
            aria-label={cancelButtonLabel}
          >
            {cancelButtonLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

