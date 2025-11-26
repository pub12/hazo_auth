// file_description: Gravatar tab component for profile picture dialog
// section: client_directive
"use client";

// section: imports
import { useState, useEffect } from "react";
import { Switch } from "hazo_auth/components/ui/switch";
import { Label } from "hazo_auth/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "hazo_auth/components/ui/avatar";
import { Info } from "lucide-react";
import gravatarUrl from "gravatar-url";

// section: types
export type ProfilePictureGravatarTabProps = {
  email: string;
  useGravatar: boolean;
  onUseGravatarChange: (use: boolean) => void;
  disabled?: boolean;
  gravatarSetupMessage: string;
  gravatarNoAccountMessage: string;
  gravatarSize: number;
};

// section: component
/**
 * Gravatar tab component for profile picture dialog
 * Shows Gravatar preview and setup instructions
 * @param props - Component props including email, useGravatar state, and change handler
 * @returns Gravatar tab component
 */
export function ProfilePictureGravatarTab({
  email,
  useGravatar,
  onUseGravatarChange,
  disabled = false,
  gravatarSetupMessage,
  gravatarNoAccountMessage,
  gravatarSize,
}: ProfilePictureGravatarTabProps) {
  const [gravatarUrlState, setGravatarUrlState] = useState<string>("");
  const [gravatarExists, setGravatarExists] = useState<boolean | null>(null);

  useEffect(() => {
    if (email) {
      const url = gravatarUrl(email, {
        size: gravatarSize,
        default: "404", // Return 404 if Gravatar doesn't exist
      });
      setGravatarUrlState(url);

      // Check if Gravatar exists by trying to load the image
      const img = new Image();
      img.onload = () => {
        setGravatarExists(true);
      };
      img.onerror = () => {
        setGravatarExists(false);
      };
      img.src = url;
    }
  }, [email]);

  const getInitials = (): string => {
    if (email) {
      return email[0]?.toUpperCase() || "?";
    }
    return "?";
  };

  return (
    <div className="cls_profile_picture_gravatar_tab flex flex-col gap-4">
      {/* Switch */}
      <div className="cls_profile_picture_gravatar_tab_switch flex items-center gap-3">
        <Switch
          id="use-gravatar"
          checked={useGravatar}
          onCheckedChange={onUseGravatarChange}
          disabled={disabled}
          className="cls_profile_picture_gravatar_tab_switch_input"
          aria-label="Use Gravatar photo"
        />
        <Label
          htmlFor="use-gravatar"
          className="cls_profile_picture_gravatar_tab_switch_label text-sm font-medium text-slate-700 cursor-pointer"
        >
          Use Gravatar photo
        </Label>
      </div>

      {/* Preview */}
      <div className="cls_profile_picture_gravatar_tab_preview flex flex-col items-center gap-4 p-6 border border-slate-200 rounded-lg bg-slate-50">
        {gravatarExists === true ? (
          <>
            <Avatar className="cls_profile_picture_gravatar_tab_avatar h-32 w-32">
              <AvatarImage
                src={gravatarUrlState}
                alt="Gravatar profile picture"
                className="cls_profile_picture_gravatar_tab_avatar_image"
              />
              <AvatarFallback className="cls_profile_picture_gravatar_tab_avatar_fallback bg-slate-200 text-slate-600 text-3xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <p className="cls_profile_picture_gravatar_tab_success_text text-sm text-slate-600 text-center">
              Your Gravatar is available and will be used as your profile picture.
            </p>
          </>
        ) : gravatarExists === false ? (
          <>
            <div className="cls_profile_picture_gravatar_tab_no_gravatar flex flex-col items-center gap-4">
              <div className="cls_profile_picture_gravatar_tab_no_gravatar_icon flex items-center justify-center w-16 h-16 rounded-full bg-slate-100">
                <Info className="h-8 w-8 text-slate-400" aria-hidden="true" />
              </div>
              <div className="cls_profile_picture_gravatar_tab_no_gravatar_content flex flex-col gap-2 text-center">
                <p className="cls_profile_picture_gravatar_tab_no_gravatar_title text-sm font-medium text-slate-900">
                  No Gravatar found
                </p>
                <p className="cls_profile_picture_gravatar_tab_no_gravatar_message text-sm text-slate-600">
                  {gravatarSetupMessage} <span className="font-semibold">{email}</span>:
                </p>
                <ol className="cls_profile_picture_gravatar_tab_no_gravatar_steps text-sm text-slate-600 list-decimal list-inside space-y-1 mt-2">
                  <li>Visit <a href="https://gravatar.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">gravatar.com</a></li>
                  <li>Sign up or log in with your email: <span className="font-mono text-xs">{email}</span></li>
                  <li>Upload a profile picture</li>
                  <li>Return here and refresh to see your Gravatar</li>
                </ol>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="cls_profile_picture_gravatar_tab_loading flex items-center justify-center">
              <p className="cls_profile_picture_gravatar_tab_loading_text text-sm text-slate-600">
                Checking Gravatar...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

