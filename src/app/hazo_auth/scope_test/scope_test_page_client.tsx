// file_description: Client component for scope test page - tests hazo_get_auth with HRBAC scope options
// Uses unified hazo_scopes table with parent_id hierarchy
// section: client_directive
"use client";

// section: imports
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Loader2, Play, AlertCircle, CheckCircle } from "lucide-react";
import { useHazoAuthConfig } from "../../../contexts/hazo_auth_provider";
import { use_hazo_auth } from "../../../components/layouts/shared/hooks/use_hazo_auth";

// section: types
type ScopeTestPageClientProps = {
  hrbacEnabled: boolean;
};

type TestResult = {
  success: boolean;
  authenticated: boolean;
  permission_ok: boolean;
  scope_ok?: boolean;
  scope_access_via?: {
    scope_id: string;
    scope_name?: string;
  };
  user?: {
    id: string;
    email_address: string;
    name: string | null;
  };
  permissions?: string[];
  error?: string;
};

// section: component
/**
 * Client component for scope test page
 * Allows testing hazo_get_auth with various scope options
 * @param props - Component props
 * @returns Scope test page component
 */
export function ScopeTestPageClient({ hrbacEnabled }: ScopeTestPageClientProps) {
  const { apiBasePath } = useHazoAuthConfig();
  const authResult = use_hazo_auth();

  // Form state
  const [scopeId, setScopeId] = useState("");
  const [requiredPermissions, setRequiredPermissions] = useState("");

  // Test state
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Run the test
  const handleRunTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      if (scopeId) params.append("scope_id", scopeId);
      if (requiredPermissions) {
        requiredPermissions.split(",").forEach((p) => {
          const trimmed = p.trim();
          if (trimmed) params.append("required_permissions", trimmed);
        });
      }

      const response = await fetch(`${apiBasePath}/scope_test?${params}`);
      const data = await response.json();

      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        authenticated: false,
        permission_ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setTesting(false);
    }
  };

  // Clear results
  const handleClear = () => {
    setScopeId("");
    setRequiredPermissions("");
    setTestResult(null);
  };

  if (!hrbacEnabled) {
    return (
      <div className="cls_scope_test_page flex flex-col items-center justify-center p-8 gap-4">
        <AlertCircle className="h-12 w-12 text-amber-500" />
        <h1 className="text-xl font-semibold">HRBAC Not Enabled</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Hierarchical Role-Based Access Control (HRBAC) is not enabled in your configuration.
          Enable it by setting <code className="bg-muted px-1 py-0.5 rounded">enable_hrbac = true</code> in
          the <code className="bg-muted px-1 py-0.5 rounded">[hazo_auth__scope_hierarchy]</code> section of your config.
        </p>
      </div>
    );
  }

  if (authResult.loading) {
    return (
      <div className="cls_scope_test_page flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!authResult.authenticated) {
    return (
      <div className="cls_scope_test_page flex flex-col items-center justify-center p-8 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h1 className="text-xl font-semibold">Authentication Required</h1>
        <p className="text-muted-foreground">Please log in to test scope access.</p>
      </div>
    );
  }

  return (
    <div className="cls_scope_test_page flex flex-col gap-6 p-4 w-full max-w-4xl mx-auto">
      <div className="cls_scope_test_header">
        <h1 className="text-2xl font-bold">Scope Access Test</h1>
        <p className="text-muted-foreground">
          Test how <code className="bg-muted px-1 py-0.5 rounded">hazo_get_auth</code> evaluates scope access for the current user.
        </p>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current User</CardTitle>
          <CardDescription>Information about the currently authenticated user</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground text-xs">User ID</Label>
            <p className="font-mono text-sm">{authResult.user?.id}</p>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Email</Label>
            <p className="text-sm">{authResult.user?.email_address}</p>
          </div>
          <div className="col-span-2">
            <Label className="text-muted-foreground text-xs">Permissions</Label>
            <p className="text-sm">{authResult.permissions.join(", ") || "None"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Test Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Parameters</CardTitle>
          <CardDescription>Configure scope and permission options for the test</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="scope_id">Scope ID (UUID)</Label>
            <Input
              id="scope_id"
              value={scopeId}
              onChange={(e) => setScopeId(e.target.value)}
              placeholder="Enter scope UUID to test access against"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to test without scope checking
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="required_permissions">Required Permissions (comma-separated)</Label>
            <Input
              id="required_permissions"
              value={requiredPermissions}
              onChange={(e) => setRequiredPermissions(e.target.value)}
              placeholder="e.g., admin_user_management, admin_role_management"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRunTest} disabled={testing}>
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Test
                </>
              )}
            </Button>
            <Button onClick={handleClear} variant="outline">
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResult && (
        <Card className={testResult.scope_ok === false ? "border-red-200" : testResult.scope_ok ? "border-green-200" : ""}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {testResult.scope_ok === false ? (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700">Access Denied</span>
                </>
              ) : testResult.scope_ok ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-700">Access Granted</span>
                </>
              ) : (
                "Test Results"
              )}
            </CardTitle>
            <CardDescription>Results from hazo_get_auth with the provided options</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {testResult.error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-red-700 text-sm">{testResult.error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Authenticated</Label>
                <p className={`text-sm font-medium ${testResult.authenticated ? "text-green-600" : "text-red-600"}`}>
                  {testResult.authenticated ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Permission OK</Label>
                <p className={`text-sm font-medium ${testResult.permission_ok ? "text-green-600" : "text-red-600"}`}>
                  {testResult.permission_ok ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Scope OK</Label>
                <p className={`text-sm font-medium ${
                  testResult.scope_ok === undefined ? "text-muted-foreground" :
                  testResult.scope_ok ? "text-green-600" : "text-red-600"
                }`}>
                  {testResult.scope_ok === undefined ? "N/A" : testResult.scope_ok ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Access Via</Label>
                <p className="text-sm">
                  {testResult.scope_access_via
                    ? testResult.scope_access_via.scope_name || testResult.scope_access_via.scope_id.substring(0, 8) + "..."
                    : "N/A"}
                </p>
              </div>
            </div>

            {testResult.scope_access_via && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-green-700 text-sm">
                  Access granted via scope: <strong>{testResult.scope_access_via.scope_name || testResult.scope_access_via.scope_id}</strong>
                </p>
              </div>
            )}

            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Show raw response
              </summary>
              <pre className="mt-2 bg-muted p-3 rounded text-xs overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
