// file_description: Test layout for app_user_data functionality
"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { cn } from "../../../lib/utils";

type AppUserDataTestLayoutProps = {
  className?: string;
};

export function AppUserDataTestLayout({ className }: AppUserDataTestLayoutProps) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  // Load current data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/hazo_auth/app_user_data");
      const result = await response.json();

      if (response.status === 401) {
        setAuthenticated(false);
        return;
      }

      setAuthenticated(true);

      if (result.success) {
        setData(result.data);
        setInputValue(result.data ? JSON.stringify(result.data, null, 2) : "");
      } else {
        setError(result.error || "Failed to load data");
      }
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const parsedData = JSON.parse(inputValue);
      const response = await fetch("/api/hazo_auth/app_user_data", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: parsedData }),
      });
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setInputValue(JSON.stringify(result.data, null, 2));
        setSuccess("Data merged successfully!");
      } else {
        setError(result.error || "Failed to merge data");
      }
    } catch (err) {
      setError("Invalid JSON format");
    } finally {
      setLoading(false);
    }
  };

  const handleReplace = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const parsedData = JSON.parse(inputValue);
      const response = await fetch("/api/hazo_auth/app_user_data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: parsedData }),
      });
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setInputValue(JSON.stringify(result.data, null, 2));
        setSuccess("Data replaced successfully!");
      } else {
        setError(result.error || "Failed to replace data");
      }
    } catch (err) {
      setError("Invalid JSON format");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/hazo_auth/app_user_data", {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        setData(null);
        setInputValue("");
        setSuccess("Data cleared successfully!");
      } else {
        setError(result.error || "Failed to clear data");
      }
    } catch (err) {
      setError("Failed to clear data");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    const sampleData = {
      preferences: {
        theme: "dark",
        notifications: true,
        language: "en",
      },
      settings: {
        dashboard_layout: "grid",
        items_per_page: 25,
      },
      custom_field: "Hello World!",
    };
    setInputValue(JSON.stringify(sampleData, null, 2));
  };

  if (authenticated === false) {
    return (
      <div className={cn("w-full max-w-2xl mx-auto p-6", className)}>
        <div className="p-4 border rounded-md bg-muted">
          Please log in to test the app_user_data functionality.
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-2xl mx-auto p-6 space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>App User Data Test</CardTitle>
          <CardDescription>
            Test the app_user_data JSON field for storing custom application-specific user data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-4 border border-red-500 rounded-md bg-red-50 text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 border border-green-500 rounded-md bg-green-50 text-green-700">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Current Data (JSON)
            </label>
            <textarea
              value={inputValue}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
              placeholder='{"key": "value"}'
              className="w-full font-mono text-sm min-h-[200px] p-3 border rounded-md bg-background"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={loadData} variant="outline" disabled={loading}>
              Reload
            </Button>
            <Button onClick={handleLoadSample} variant="outline" disabled={loading}>
              Load Sample
            </Button>
            <Button onClick={handleMerge} disabled={loading}>
              PATCH (Merge)
            </Button>
            <Button onClick={handleReplace} variant="secondary" disabled={loading}>
              PUT (Replace)
            </Button>
            <Button onClick={handleClear} variant="destructive" disabled={loading}>
              DELETE (Clear)
            </Button>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Current Stored Data:</h4>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
              {data ? JSON.stringify(data, null, 2) : "null"}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <code className="bg-muted px-2 py-1 rounded">GET /api/hazo_auth/app_user_data</code>
            <p className="text-muted-foreground mt-1">Retrieve current app_user_data</p>
          </div>
          <div>
            <code className="bg-muted px-2 py-1 rounded">PATCH /api/hazo_auth/app_user_data</code>
            <p className="text-muted-foreground mt-1">Merge new data with existing (deep merge)</p>
          </div>
          <div>
            <code className="bg-muted px-2 py-1 rounded">PUT /api/hazo_auth/app_user_data</code>
            <p className="text-muted-foreground mt-1">Replace existing data entirely</p>
          </div>
          <div>
            <code className="bg-muted px-2 py-1 rounded">DELETE /api/hazo_auth/app_user_data</code>
            <p className="text-muted-foreground mt-1">Clear all app_user_data (set to null)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
