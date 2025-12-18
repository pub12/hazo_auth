// file_description: Log viewer page for hazo_auth using hazo_logs UI component
"use client";

// section: imports
import { LogViewerPage } from "hazo_logs/ui";

// section: component
export default function LogsPage() {
  return (
    <LogViewerPage
      apiBasePath="/api/hazo_auth/logs"
      title="hazo_auth Logs"
    />
  );
}
