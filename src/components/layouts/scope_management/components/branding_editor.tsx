// file_description: Branding editor component for managing firm branding (logo, colors, tagline)
// section: client_directive
"use client";

// section: imports
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import {
  Loader2,
  Upload,
  Trash2,
  CircleCheck,
  CircleX,
  Image as ImageIcon,
  Palette,
} from "lucide-react";
import { toast } from "sonner";
import { useHazoAuthConfig } from "../../../../contexts/hazo_auth_provider";

// section: types
export type FirmBranding = {
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  tagline?: string;
};

export type BrandingEditorProps = {
  scopeId: string;
  scopeName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (branding: FirmBranding | null) => void;
  initialBranding?: FirmBranding | null;
};

// section: helpers
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

// section: component
export function BrandingEditor({
  scopeId,
  scopeName,
  isOpen,
  onClose,
  onSave,
  initialBranding,
}: BrandingEditorProps) {
  const { apiBasePath } = useHazoAuthConfig();

  // State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [logoUrl, setLogoUrl] = useState<string>(initialBranding?.logo_url || "");
  const [primaryColor, setPrimaryColor] = useState<string>(
    initialBranding?.primary_color || ""
  );
  const [secondaryColor, setSecondaryColor] = useState<string>(
    initialBranding?.secondary_color || ""
  );
  const [tagline, setTagline] = useState<string>(initialBranding?.tagline || "");

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const response = await fetch(
        `${apiBasePath}/scope_management/branding?${params}`
      );
      const data = await response.json();

      if (data.success) {
        const branding = data.branding || {};
        setLogoUrl(branding.logo_url || "");
        setPrimaryColor(branding.primary_color || "");
        setSecondaryColor(branding.secondary_color || "");
        setTagline(branding.tagline || "");
      }
    } catch (error) {
      toast.error("Failed to load branding");
    } finally {
      setLoading(false);
    }
  }, [apiBasePath, scopeId]);

  // Handle logo file upload
  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("scope_id", scopeId);
      formData.append("file", file);

      const response = await fetch(
        `${apiBasePath}/scope_management/branding/logo`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setLogoUrl(data.logo_url);
        toast.success("Logo uploaded successfully");
      } else {
        toast.error(data.error || "Failed to upload logo");
      }
    } catch (error) {
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
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
      const branding: FirmBranding = {};
      if (logoUrl) branding.logo_url = logoUrl;
      if (primaryColor) branding.primary_color = primaryColor;
      if (secondaryColor) branding.secondary_color = secondaryColor;
      if (tagline) branding.tagline = tagline;

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
        onSave?.(hasValues ? branding : null);
        onClose();
      } else {
        toast.error(data.error || "Failed to save branding");
      }
    } catch (error) {
      toast.error("Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  // Handle clear branding
  const handleClear = async () => {
    setSaving(true);
    try {
      const params = new URLSearchParams({ scope_id: scopeId });
      const response = await fetch(
        `${apiBasePath}/scope_management/branding?${params}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        setLogoUrl("");
        setPrimaryColor("");
        setSecondaryColor("");
        setTagline("");
        toast.success("Branding cleared");
        onSave?.(null);
      } else {
        toast.error(data.error || "Failed to clear branding");
      }
    } catch (error) {
      toast.error("Failed to clear branding");
    } finally {
      setSaving(false);
    }
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setLogoUrl("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="cls_branding_editor_dialog max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Firm Branding
          </DialogTitle>
          <DialogDescription>
            Customize branding for &quot;{scopeName}&quot;
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="flex flex-col gap-6 py-4">
            {/* Logo Upload */}
            <div className="flex flex-col gap-2">
              <Label>Logo</Label>
              <div className="flex items-start gap-4">
                {/* Logo Preview */}
                <div className="flex-shrink-0 w-24 h-24 border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Firm logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                {/* Upload Controls */}
                <div className="flex flex-col gap-2 flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUploadClick}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </>
                    )}
                  </Button>
                  {logoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveLogo}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, SVG or WebP. Max 500KB.
                  </p>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              {/* Primary Color */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#1a73e8"
                    className="flex-1"
                  />
                  <input
                    type="color"
                    value={primaryColor || "#000000"}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded border cursor-pointer"
                    title="Pick color"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary_color"
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder="#4285f4"
                    className="flex-1"
                  />
                  <input
                    type="color"
                    value={secondaryColor || "#000000"}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 rounded border cursor-pointer"
                    title="Pick color"
                  />
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Your trusted partner"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                A short company tagline (max 200 characters)
              </p>
            </div>

            {/* Preview */}
            {(logoUrl || primaryColor || tagline) && (
              <div className="flex flex-col gap-2">
                <Label>Preview</Label>
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: primaryColor
                      ? `${primaryColor}10`
                      : undefined,
                    borderColor: primaryColor || undefined,
                  }}
                >
                  <div className="flex items-center gap-3">
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt="Logo preview"
                        className="h-10 w-10 object-contain"
                      />
                    )}
                    <div>
                      <div
                        className="font-semibold"
                        style={{ color: primaryColor || undefined }}
                      >
                        {scopeName}
                      </div>
                      {tagline && (
                        <div
                          className="text-sm"
                          style={{ color: secondaryColor || undefined }}
                        >
                          {tagline}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={saving || loading}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          <div className="flex-1" />
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            <CircleX className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CircleCheck className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
