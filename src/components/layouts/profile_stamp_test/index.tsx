// file_description: Test page layout for ProfileStamp component demonstrating various scenarios
// section: client_directive
"use client";

// section: imports
import { useState } from "react";
import { ProfileStamp, ProfileStampCustomField } from "../shared/components/profile_stamp";
import { use_auth_status } from "../shared/hooks/use_auth_status";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";

// section: types
export type ProfileStampTestLayoutProps = {
  className?: string;
};

// section: component
/**
 * ProfileStampTestLayout - Test page for ProfileStamp component
 * Demonstrates various scenarios and configurations
 */
export function ProfileStampTestLayout({ className }: ProfileStampTestLayoutProps) {
  const authStatus = use_auth_status();
  const [showCustomFields, setShowCustomFields] = useState(true);

  // Sample custom fields for testing
  const sampleCustomFields: ProfileStampCustomField[] = [
    { label: "Role", value: "Administrator" },
    { label: "Department", value: "Engineering" },
    { label: "Joined", value: "Jan 2024" },
  ];

  return (
    <div className={`cls_profile_stamp_test_layout w-full max-w-4xl mx-auto p-6 ${className || ""}`}>
      <h1 className="text-2xl font-bold mb-6">ProfileStamp Component Test</h1>

      {/* Auth Status Info */}
      <Card className="p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Current Auth Status</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Authenticated:</div>
          <div className={authStatus.authenticated ? "text-green-600" : "text-red-600"}>
            {authStatus.authenticated ? "Yes" : "No"}
          </div>
          <div>User ID:</div>
          <div>{authStatus.user_id || "N/A"}</div>
          <div>Name:</div>
          <div>{authStatus.name || "N/A"}</div>
          <div>Email:</div>
          <div>{authStatus.email || "N/A"}</div>
          <div>Profile Picture URL:</div>
          <div className="truncate">{authStatus.profile_picture_url || "N/A"}</div>
          <div>Profile Source:</div>
          <div>{authStatus.profile_source || "N/A"}</div>
        </div>
      </Card>

      {/* Size Variants */}
      <Card className="p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Size Variants</h2>
        <div className="flex items-end gap-6">
          <div className="flex flex-col items-center gap-2">
            <ProfileStamp size="sm" />
            <span className="text-xs text-muted-foreground">sm (24px)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ProfileStamp size="default" />
            <span className="text-xs text-muted-foreground">default (32px)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ProfileStamp size="lg" />
            <span className="text-xs text-muted-foreground">lg (40px)</span>
          </div>
        </div>
      </Card>

      {/* With Custom Fields */}
      <Card className="p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">With Custom Fields</h2>
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant={showCustomFields ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCustomFields(!showCustomFields)}
          >
            {showCustomFields ? "Hide Custom Fields" : "Show Custom Fields"}
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <ProfileStamp
            size="lg"
            custom_fields={showCustomFields ? sampleCustomFields : []}
          />
          <span className="text-sm text-muted-foreground">
            Hover to see {showCustomFields ? "name, email, and custom fields" : "name and email only"}
          </span>
        </div>
        {showCustomFields && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <div className="text-xs font-mono">
              custom_fields={JSON.stringify(sampleCustomFields, null, 2)}
            </div>
          </div>
        )}
      </Card>

      {/* Display Options */}
      <Card className="p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Display Options</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <ProfileStamp show_name={true} show_email={true} />
            <span className="text-sm text-muted-foreground">
              show_name=true, show_email=true (default)
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ProfileStamp show_name={true} show_email={false} />
            <span className="text-sm text-muted-foreground">
              show_name=true, show_email=false
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ProfileStamp show_name={false} show_email={true} />
            <span className="text-sm text-muted-foreground">
              show_name=false, show_email=true
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ProfileStamp show_name={false} show_email={false} />
            <span className="text-sm text-muted-foreground">
              show_name=false, show_email=false (no hover card)
            </span>
          </div>
        </div>
      </Card>

      {/* Inline Usage Example */}
      <Card className="p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Inline Usage Example (Note Attribution)</h2>
        <div className="border rounded-lg p-4 bg-background">
          <div className="flex items-start gap-3">
            <ProfileStamp size="default" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {authStatus.name || "User"}
                </span>
                <span className="text-xs text-muted-foreground">
                  2 hours ago
                </span>
              </div>
              <p className="text-sm text-foreground">
                This is an example note with a ProfileStamp component showing who added it.
                Hover over the profile picture to see more details about the user.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Comment Thread Example */}
      <Card className="p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Comment Thread Example</h2>
        <div className="space-y-4">
          {[
            { time: "3 hours ago", text: "Great progress on the project!" },
            { time: "2 hours ago", text: "I agree, the new features look amazing." },
            { time: "1 hour ago", text: "Let me know if you need any help with the deployment." },
          ].map((comment, index) => (
            <div key={index} className="flex items-start gap-3 border-b pb-4 last:border-b-0">
              <ProfileStamp
                size="sm"
                custom_fields={[{ label: "Comment", value: `#${index + 1}` }]}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {authStatus.name || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {comment.time}
                  </span>
                </div>
                <p className="text-sm text-foreground">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* API Response Info */}
      <Card className="p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">API Response Fields</h2>
        <p className="text-sm text-muted-foreground mb-3">
          The /api/hazo_auth/me endpoint now returns these profile picture fields:
        </p>
        <div className="p-3 bg-muted rounded-md font-mono text-xs">
          <pre>{`{
  "profile_picture_url": "${authStatus.profile_picture_url || "null"}",
  "profile_image": "${authStatus.profile_image || "null"}",     // alias
  "avatar_url": "${authStatus.avatar_url || "null"}",           // alias
  "image": "${authStatus.image || "null"}"                      // alias
}`}</pre>
        </div>
      </Card>

      {/* Code Example */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Usage Code Example</h2>
        <div className="p-3 bg-muted rounded-md font-mono text-xs overflow-x-auto">
          <pre>{`// Basic usage
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
/>`}</pre>
        </div>
      </Card>
    </div>
  );
}

export default ProfileStampTestLayout;
