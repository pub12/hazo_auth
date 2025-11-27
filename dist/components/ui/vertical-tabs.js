// file_description: vertical tabs component for sidebar-style navigation
// section: client_directive
"use client";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx } from "react/jsx-runtime";
// section: imports
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/utils";
// section: components
const VerticalTabs = TabsPrimitive.Root;
const VerticalTabsList = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (_jsx(TabsPrimitive.List, Object.assign({ ref: ref, className: cn("inline-flex flex-col items-start justify-start rounded-md bg-muted p-1 text-muted-foreground", className) }, props)));
});
VerticalTabsList.displayName = "VerticalTabsList";
const VerticalTabsTrigger = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (_jsx(TabsPrimitive.Trigger, Object.assign({ ref: ref, className: cn("inline-flex items-center justify-start whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className) }, props)));
});
VerticalTabsTrigger.displayName = "VerticalTabsTrigger";
const VerticalTabsContent = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (_jsx(TabsPrimitive.Content, Object.assign({ ref: ref, className: cn("mt-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className) }, props)));
});
VerticalTabsContent.displayName = "VerticalTabsContent";
export { VerticalTabs, VerticalTabsList, VerticalTabsTrigger, VerticalTabsContent };
