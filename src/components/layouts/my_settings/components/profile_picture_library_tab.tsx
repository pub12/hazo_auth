// file_description: Library tab component for profile picture dialog with category tabs and image grid
// section: client_directive
"use client";

// section: imports
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VerticalTabs, VerticalTabsList, VerticalTabsTrigger, VerticalTabsContent } from "@/components/ui/vertical-tabs";
import { Loader2 } from "lucide-react";
import { HazoUITooltip } from "@/components/ui/hazo_ui_tooltip";

// section: types
export type ProfilePictureLibraryTabProps = {
  useLibrary: boolean;
  onUseLibraryChange: (use: boolean) => void;
  onPhotoSelect: (photoUrl: string) => void;
  disabled?: boolean;
  libraryPhotoPath: string;
  currentPhotoUrl?: string;
  libraryTooltipMessage: string;
  tooltipIconSizeSmall: number;
  libraryPhotoGridColumns: number;
  libraryPhotoPreviewSize: number;
};

// section: component
/**
 * Library tab component for profile picture dialog
 * Two columns: left = vertical category tabs, right = image grid + preview
 * Lazy loads thumbnails when category is selected
 * @param props - Component props including library state, photo selection handler, and configuration
 * @returns Library tab component
 */
export function ProfilePictureLibraryTab({
  useLibrary,
  onUseLibraryChange,
  onPhotoSelect,
  disabled = false,
  libraryPhotoPath,
  currentPhotoUrl,
  libraryTooltipMessage,
  tooltipIconSizeSmall,
  libraryPhotoGridColumns,
  libraryPhotoPreviewSize,
}: ProfilePictureLibraryTabProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(currentPhotoUrl || null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch("/api/auth/library_photos");
        const data = await response.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
          // Select first category if available
          if (data.categories.length > 0) {
            setSelectedCategory(data.categories[0]);
          }
        }
      } catch (error) {
        // Client-side error handling - show toast notification
        import("sonner").then(({ toast }) => {
          toast.error("Failed to load photo categories. Please try again.");
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    void loadCategories();
  }, []);

  // Sync selectedPhoto with currentPhotoUrl when it changes
  useEffect(() => {
    if (currentPhotoUrl && currentPhotoUrl !== selectedPhoto) {
      setSelectedPhoto(currentPhotoUrl);
    }
  }, [currentPhotoUrl]);

  // Load photos when category is selected
  useEffect(() => {
    if (!selectedCategory) {
      setPhotos([]);
      if (!currentPhotoUrl) {
        setSelectedPhoto(null);
      }
      return;
    }

    const loadPhotos = async () => {
      setLoadingPhotos(true);
      try {
        const response = await fetch(`/api/auth/library_photos?category=${encodeURIComponent(selectedCategory)}`);
        const data = await response.json();
        if (data.success && data.photos) {
          setPhotos(data.photos);
          
          // If we have a current photo URL and it's in this category, select it
          if (currentPhotoUrl && data.photos.includes(currentPhotoUrl)) {
            setSelectedPhoto(currentPhotoUrl);
            onPhotoSelect(currentPhotoUrl);
          } else if (data.photos.length > 0) {
            // Otherwise, select first photo if available and notify parent
            const firstPhoto = data.photos[0];
            setSelectedPhoto(firstPhoto);
            onPhotoSelect(firstPhoto);
          } else if (!currentPhotoUrl) {
            // Clear selection if no photos and no current photo
            setSelectedPhoto(null);
          }
        }
      } catch (error) {
        // Client-side error handling - show toast notification
        import("sonner").then(({ toast }) => {
          toast.error("Failed to load photos. Please try again.");
        });
      } finally {
        setLoadingPhotos(false);
      }
    };

    void loadPhotos();
  }, [selectedCategory, onPhotoSelect, currentPhotoUrl]);

  const handlePhotoClick = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    onPhotoSelect(photoUrl);
  };

  const getInitials = (): string => {
    return "L";
  };

  // Map column count to Tailwind grid class
  const getGridColumnsClass = (columns: number): string => {
    const columnMap: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
      7: "grid-cols-7",
      8: "grid-cols-8",
    };
    return columnMap[columns] || "grid-cols-4";
  };

  return (
    <div className="cls_profile_picture_library_tab flex flex-col gap-4">
      {/* Switch */}
      <div className="cls_profile_picture_library_tab_switch flex items-center gap-3">
        <Switch
          id="use-library"
          checked={useLibrary}
          onCheckedChange={onUseLibraryChange}
          disabled={disabled}
          className="cls_profile_picture_library_tab_switch_input"
          aria-label="Use library photo"
        />
        <Label
          htmlFor="use-library"
          className="cls_profile_picture_library_tab_switch_label text-sm font-medium text-slate-700 cursor-pointer"
        >
          Use library photo
        <HazoUITooltip
          message={libraryTooltipMessage}
          iconSize={tooltipIconSizeSmall}
          side="top"
        />
        </Label>
      </div>

      {/* Three columns: category tabs (25%), photo grid (50%), preview (25%) */}
      <div className="cls_profile_picture_library_tab_content grid grid-cols-12 gap-4">
        {/* Left column: Category tabs (25% - 3 columns) */}
        <div className="cls_profile_picture_library_tab_categories_container flex flex-col gap-2 col-span-3">
          <Label className="cls_profile_picture_library_tab_categories_label text-sm font-medium text-slate-700">
            Categories
          </Label>
          {loadingCategories ? (
            <div className="cls_profile_picture_library_tab_loading flex items-center justify-center p-8 border border-slate-200 rounded-lg bg-slate-50 min-h-[400px]">
              <Loader2 className="h-6 w-6 text-slate-400 animate-spin" aria-hidden="true" />
            </div>
          ) : categories.length > 0 ? (
            <VerticalTabs
              value={selectedCategory || categories[0]}
              onValueChange={setSelectedCategory}
              className="cls_profile_picture_library_tab_vertical_tabs"
            >
              <VerticalTabsList className="cls_profile_picture_library_tab_vertical_tabs_list w-full">
                {categories.map((category) => (
                  <VerticalTabsTrigger
                    key={category}
                    value={category}
                    className="cls_profile_picture_library_tab_vertical_tabs_trigger w-full justify-start"
                  >
                    {category}
                  </VerticalTabsTrigger>
                ))}
              </VerticalTabsList>
            </VerticalTabs>
          ) : (
            <div className="cls_profile_picture_library_tab_no_categories flex items-center justify-center p-8 border border-slate-200 rounded-lg bg-slate-50 min-h-[400px]">
              <p className="cls_profile_picture_library_tab_no_categories_text text-sm text-slate-600">
                No categories available
              </p>
            </div>
          )}
        </div>

        {/* Middle column: Photo grid (50% - 6 columns) */}
        <div className="cls_profile_picture_library_tab_photos_container flex flex-col gap-2 col-span-6">
          <Label className="cls_profile_picture_library_tab_photos_label text-sm font-medium text-slate-700">
            Photos
          </Label>
          {loadingPhotos ? (
            <div className="cls_profile_picture_library_tab_photos_loading flex items-center justify-center p-8 border border-slate-200 rounded-lg bg-slate-50 min-h-[400px]">
              <Loader2 className="h-6 w-6 text-slate-400 animate-spin" aria-hidden="true" />
            </div>
          ) : photos.length > 0 ? (
            <div className={`cls_profile_picture_library_tab_photos_grid grid ${getGridColumnsClass(libraryPhotoGridColumns)} gap-3 overflow-y-auto p-4 border border-slate-200 rounded-lg bg-slate-50 min-h-[400px] max-h-[400px]`}>
              {photos.map((photoUrl) => (
                <button
                  key={photoUrl}
                  type="button"
                  onClick={() => handlePhotoClick(photoUrl)}
                  className={`
                    cls_profile_picture_library_tab_photo_thumbnail
                    aspect-square rounded-lg overflow-hidden border-2 transition-colors cursor-pointer
                    ${selectedPhoto === photoUrl ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200 hover:border-slate-300"}
                  `}
                  aria-label={`Select photo ${photoUrl.split('/').pop()}`}
                >
                  <img
                    src={photoUrl}
                    alt={`Library photo ${photoUrl.split('/').pop()}`}
                    className="cls_profile_picture_library_tab_photo_thumbnail_image w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="cls_profile_picture_library_tab_no_photos flex items-center justify-center p-8 border border-slate-200 rounded-lg bg-slate-50 min-h-[400px]">
              <p className="cls_profile_picture_library_tab_no_photos_text text-sm text-slate-600">
                No photos in this category
              </p>
            </div>
          )}
        </div>

        {/* Right column: Preview (25% - 3 columns) */}
        <div className="cls_profile_picture_library_tab_preview_container flex flex-col gap-2 col-span-3">
          <Label className="cls_profile_picture_library_tab_preview_label text-sm font-medium text-slate-700">
            Preview
          </Label>
          {selectedPhoto ? (
            <div className="cls_profile_picture_library_tab_preview flex flex-col items-center gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50 min-h-[400px] justify-center">
              <div className="cls_profile_picture_library_tab_preview_image_wrapper w-full flex items-center justify-center">
                <img
                  src={selectedPhoto}
                  alt="Selected library photo preview"
                  className="cls_profile_picture_library_tab_preview_image max-w-full max-h-[350px] rounded-lg object-contain"
                  onError={(e) => {
                    // Fallback if preview image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const wrapper = target.parentElement;
                    if (wrapper) {
                      wrapper.innerHTML = '<p class="text-sm text-red-500">Failed to load preview</p>';
                    }
                  }}
                />
              </div>
              <p className="cls_profile_picture_library_tab_preview_text text-sm text-slate-600 text-center">
                Selected photo preview
              </p>
            </div>
          ) : (
            <div className="cls_profile_picture_library_tab_preview_empty flex flex-col items-center justify-center gap-2 p-8 border border-slate-200 rounded-lg bg-slate-50 min-h-[400px]">
              <Avatar className="cls_profile_picture_library_tab_preview_empty_avatar h-32 w-32">
                <AvatarFallback className="cls_profile_picture_library_tab_preview_empty_avatar_fallback bg-slate-200 text-slate-600 text-3xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <p className="cls_profile_picture_library_tab_preview_empty_text text-sm text-slate-500 text-center">
                Select a photo to see preview
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

