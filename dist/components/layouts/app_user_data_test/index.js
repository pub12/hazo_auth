// file_description: Test layout for app_user_data functionality
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { cn } from "../../../lib/utils";
export function AppUserDataTestLayout({ className }) {
    const [data, setData] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [authenticated, setAuthenticated] = useState(null);
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
            }
            else {
                setError(result.error || "Failed to load data");
            }
        }
        catch (err) {
            setError("Failed to load data");
        }
        finally {
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
            }
            else {
                setError(result.error || "Failed to merge data");
            }
        }
        catch (err) {
            setError("Invalid JSON format");
        }
        finally {
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
            }
            else {
                setError(result.error || "Failed to replace data");
            }
        }
        catch (err) {
            setError("Invalid JSON format");
        }
        finally {
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
            }
            else {
                setError(result.error || "Failed to clear data");
            }
        }
        catch (err) {
            setError("Failed to clear data");
        }
        finally {
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
        return (_jsx("div", { className: cn("w-full max-w-2xl mx-auto p-6", className), children: _jsx("div", { className: "p-4 border rounded-md bg-muted", children: "Please log in to test the app_user_data functionality." }) }));
    }
    return (_jsxs("div", { className: cn("w-full max-w-2xl mx-auto p-6 space-y-6", className), children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "App User Data Test" }), _jsx(CardDescription, { children: "Test the app_user_data JSON field for storing custom application-specific user data." })] }), _jsxs(CardContent, { className: "space-y-4", children: [error && (_jsx("div", { className: "p-4 border border-red-500 rounded-md bg-red-50 text-red-700", children: error })), success && (_jsx("div", { className: "p-4 border border-green-500 rounded-md bg-green-50 text-green-700", children: success })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Current Data (JSON)" }), _jsx("textarea", { value: inputValue, onChange: (e) => setInputValue(e.target.value), placeholder: '{"key": "value"}', className: "w-full font-mono text-sm min-h-[200px] p-3 border rounded-md bg-background" })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { onClick: loadData, variant: "outline", disabled: loading, children: "Reload" }), _jsx(Button, { onClick: handleLoadSample, variant: "outline", disabled: loading, children: "Load Sample" }), _jsx(Button, { onClick: handleMerge, disabled: loading, children: "PATCH (Merge)" }), _jsx(Button, { onClick: handleReplace, variant: "secondary", disabled: loading, children: "PUT (Replace)" }), _jsx(Button, { onClick: handleClear, variant: "destructive", disabled: loading, children: "DELETE (Clear)" })] }), _jsxs("div", { className: "pt-4 border-t", children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Current Stored Data:" }), _jsx("pre", { className: "bg-muted p-4 rounded-md text-sm overflow-x-auto", children: data ? JSON.stringify(data, null, 2) : "null" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "API Reference" }) }), _jsxs(CardContent, { className: "space-y-3 text-sm", children: [_jsxs("div", { children: [_jsx("code", { className: "bg-muted px-2 py-1 rounded", children: "GET /api/hazo_auth/app_user_data" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Retrieve current app_user_data" })] }), _jsxs("div", { children: [_jsx("code", { className: "bg-muted px-2 py-1 rounded", children: "PATCH /api/hazo_auth/app_user_data" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Merge new data with existing (deep merge)" })] }), _jsxs("div", { children: [_jsx("code", { className: "bg-muted px-2 py-1 rounded", children: "PUT /api/hazo_auth/app_user_data" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Replace existing data entirely" })] }), _jsxs("div", { children: [_jsx("code", { className: "bg-muted px-2 py-1 rounded", children: "DELETE /api/hazo_auth/app_user_data" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Clear all app_user_data (set to null)" })] })] })] })] }));
}
