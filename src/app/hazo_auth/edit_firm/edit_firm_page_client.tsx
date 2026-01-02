// file_description: client component for testing branding editor
// section: client_directive
"use client";

// section: imports
import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import { BrandingEditor } from "../../../components/layouts/scope_management/components/branding_editor";
import { Loader2, Palette } from "lucide-react";
import { HazoAuthProvider } from "../../../contexts/hazo_auth_provider";

// section: types
type Scope = {
  id: string;
  name: string;
  level: string;
};

// section: inner_component
function EditFirmContent() {
  const [loading, setLoading] = useState(true);
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [selectedScopeId, setSelectedScopeId] = useState<string>("");
  const [editorOpen, setEditorOpen] = useState(false);

  // Fetch user's scopes
  useEffect(() => {
    async function fetchScopes() {
      try {
        const response = await fetch("/api/hazo_auth/me");
        const data = await response.json();

        if (data.scopes && Array.isArray(data.scopes)) {
          setScopes(data.scopes);
          if (data.scopes.length > 0) {
            setSelectedScopeId(data.scopes[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch scopes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchScopes();
  }, []);

  const selectedScope = scopes.find((s) => s.id === selectedScopeId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (scopes.length === 0) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>No Firms Available</CardTitle>
          <CardDescription>
            You are not a member of any firms. Create a firm first to edit its branding.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Edit Firm Branding
          </CardTitle>
          <CardDescription>
            Select a firm to customize its branding (logo, colors, tagline)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="scope-select">Select Firm</Label>
            <Select value={selectedScopeId} onValueChange={setSelectedScopeId}>
              <SelectTrigger id="scope-select">
                <SelectValue placeholder="Select a firm" />
              </SelectTrigger>
              <SelectContent>
                {scopes.map((scope) => (
                  <SelectItem key={scope.id} value={scope.id}>
                    {scope.name} ({scope.level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => setEditorOpen(true)}
            disabled={!selectedScopeId}
          >
            <Palette className="h-4 w-4 mr-2" />
            Edit Branding
          </Button>
        </CardContent>
      </Card>

      {selectedScope && (
        <BrandingEditor
          scopeId={selectedScope.id}
          scopeName={selectedScope.name}
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </>
  );
}

// section: component
export function EditFirmPageClient() {
  return (
    <HazoAuthProvider apiBasePath="/api/hazo_auth">
      <EditFirmContent />
    </HazoAuthProvider>
  );
}
