// file_description: setup status dashboard page for visualizing hazo_auth configuration
// This page is only available in development mode
"use client";

// section: imports
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";

// section: types
type CheckStatus = "ok" | "warning" | "error";

type HealthCheckResponse = {
  status: "ok" | "partial" | "error";
  environment: string;
  timestamp: string;
  checks: {
    config: { status: CheckStatus; message: string };
    database: { status: CheckStatus; message: string };
    email: { status: CheckStatus; message: string };
    routes: Record<string, "ok" | "missing">;
    profile_pictures: { status: CheckStatus; message: string };
  };
  recommendations: string[];
};

// section: components
function StatusIcon({ status }: { status: CheckStatus | "ok" | "missing" }) {
  switch (status) {
    case "ok":
      return <CheckCircle className="h-5 w-5 text-green-500" aria-label="Status OK" />;
    case "error":
    case "missing":
      return <XCircle className="h-5 w-5 text-red-500" aria-label="Status Error" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" aria-label="Status Warning" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-gray-400" aria-label="Status Unknown" />;
  }
}

function StatusBadge({ status }: { status: "ok" | "partial" | "error" }) {
  const colors = {
    ok: "bg-green-100 text-green-800 border-green-200",
    partial: "bg-yellow-100 text-yellow-800 border-yellow-200",
    error: "bg-red-100 text-red-800 border-red-200",
  };

  const labels = {
    ok: "All Checks Passed",
    partial: "Partial Setup",
    error: "Setup Incomplete",
  };

  return (
    <span className={`cls_status_badge inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}

function CheckCard({
  title,
  status,
  message,
  children,
}: {
  title: string;
  status: CheckStatus;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="cls_check_card">
      <CardHeader className="cls_check_card_header pb-2">
        <div className="cls_check_card_title_row flex items-center justify-between">
          <CardTitle className="cls_check_card_title text-base font-medium">{title}</CardTitle>
          <StatusIcon status={status} />
        </div>
      </CardHeader>
      <CardContent className="cls_check_card_content">
        <p className="cls_check_card_message text-sm text-muted-foreground">{message}</p>
        {children}
      </CardContent>
    </Card>
  );
}

function RoutesCard({ routes }: { routes: Record<string, "ok" | "missing"> }) {
  const [expanded, setExpanded] = useState(false);
  const entries = Object.entries(routes);
  const ok_count = entries.filter(([, status]) => status === "ok").length;
  const missing_count = entries.filter(([, status]) => status === "missing").length;

  const overall_status: CheckStatus = missing_count === 0 ? "ok" : missing_count > 5 ? "error" : "warning";

  return (
    <Card className="cls_routes_card">
      <CardHeader className="cls_routes_card_header pb-2">
        <div className="cls_routes_card_title_row flex items-center justify-between">
          <CardTitle className="cls_routes_card_title text-base font-medium">
            API Routes ({ok_count}/{entries.length})
          </CardTitle>
          <StatusIcon status={overall_status} />
        </div>
      </CardHeader>
      <CardContent className="cls_routes_card_content">
        <p className="cls_routes_summary text-sm text-muted-foreground mb-2">
          {missing_count === 0
            ? "All routes configured"
            : `${missing_count} routes missing`}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="cls_routes_toggle_btn mb-2"
          aria-label={expanded ? "Hide route details" : "Show route details"}
        >
          {expanded ? "Hide Details" : "Show Details"}
        </Button>
        {expanded && (
          <div className="cls_routes_list mt-2 space-y-1">
            {entries.map(([route, status]) => (
              <div
                key={route}
                className={`cls_route_item flex items-center gap-2 text-sm p-1 rounded ${
                  status === "missing" ? "bg-red-50" : ""
                }`}
              >
                <StatusIcon status={status} />
                <span className="cls_route_name font-mono text-xs">/api/hazo_auth/{route}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecommendationsList({ recommendations }: { recommendations: string[] }) {
  const [copied, setCopied] = useState<number | null>(null);

  const copy_to_clipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(index);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      console.error("Failed to copy to clipboard");
    }
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="cls_recommendations_card mt-6">
      <CardHeader className="cls_recommendations_header">
        <CardTitle className="cls_recommendations_title text-lg">Recommendations</CardTitle>
        <CardDescription className="cls_recommendations_description">
          Follow these steps to complete your setup
        </CardDescription>
      </CardHeader>
      <CardContent className="cls_recommendations_content">
        <ul className="cls_recommendations_list space-y-3">
          {recommendations.map((rec, index) => (
            <li
              key={index}
              className="cls_recommendation_item flex items-start gap-3 p-3 bg-muted rounded-lg"
            >
              <span className="cls_recommendation_number flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <div className="cls_recommendation_content flex-1">
                <code className="cls_recommendation_code text-sm bg-background px-2 py-1 rounded">
                  {rec}
                </code>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copy_to_clipboard(rec, index)}
                className="cls_recommendation_copy_btn flex-shrink-0"
                aria-label="Copy command to clipboard"
              >
                {copied === index ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// section: main_component
export default function SetupStatusPage() {
  const [health_data, set_health_data] = useState<HealthCheckResponse | null>(null);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);
  const [is_production, set_is_production] = useState(false);

  const fetch_health = async () => {
    set_loading(true);
    set_error(null);

    try {
      const response = await fetch("/api/hazo_auth/health");
      
      if (response.status === 403) {
        set_is_production(true);
        set_error("Health check is disabled in production mode");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      set_health_data(data);
    } catch (err) {
      set_error(err instanceof Error ? err.message : "Failed to fetch health status");
    } finally {
      set_loading(false);
    }
  };

  useEffect(() => {
    void fetch_health();
  }, []);

  // Production mode warning
  if (is_production) {
    return (
      <div className="cls_setup_status_production min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="cls_production_card max-w-md">
          <CardHeader className="cls_production_header">
            <div className="cls_production_icon flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
            </div>
            <CardTitle className="cls_production_title text-center">
              Setup Status Unavailable
            </CardTitle>
            <CardDescription className="cls_production_description text-center">
              This page is only available in development mode for security reasons.
            </CardDescription>
          </CardHeader>
          <CardContent className="cls_production_content text-center">
            <p className="cls_production_hint text-sm text-muted-foreground">
              To check setup status, run your app with{" "}
              <code className="bg-muted px-1 py-0.5 rounded">NODE_ENV=development</code>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="cls_setup_status_loading min-h-screen flex items-center justify-center bg-background">
        <div className="cls_loading_spinner flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="cls_loading_text text-muted-foreground">Checking setup status...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !is_production) {
    return (
      <div className="cls_setup_status_error min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="cls_error_card max-w-md">
          <CardHeader className="cls_error_header">
            <div className="cls_error_icon flex justify-center mb-4">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="cls_error_title text-center">Error</CardTitle>
            <CardDescription className="cls_error_description text-center">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="cls_error_content flex justify-center">
            <Button onClick={() => void fetch_health()} className="cls_retry_btn">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (!health_data) {
    return null;
  }

  return (
    <div className="cls_setup_status_page min-h-screen bg-background p-4 md:p-8">
      <div className="cls_setup_status_container max-w-4xl mx-auto">
        {/* Header */}
        <div className="cls_setup_status_header flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="cls_header_content">
            <h1 className="cls_header_title text-2xl font-bold">hazo_auth Setup Status</h1>
            <p className="cls_header_description text-muted-foreground">
              Last checked: {new Date(health_data.timestamp).toLocaleString()}
            </p>
          </div>
          <div className="cls_header_actions flex items-center gap-3">
            <StatusBadge status={health_data.status} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetch_health()}
              className="cls_refresh_btn"
              aria-label="Refresh status"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="cls_status_cards_grid grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <CheckCard
            title="Configuration Files"
            status={health_data.checks.config.status}
            message={health_data.checks.config.message}
          />
          <CheckCard
            title="Database"
            status={health_data.checks.database.status}
            message={health_data.checks.database.message}
          />
          <CheckCard
            title="Email Service"
            status={health_data.checks.email.status}
            message={health_data.checks.email.message}
          />
          <CheckCard
            title="Profile Pictures"
            status={health_data.checks.profile_pictures.status}
            message={health_data.checks.profile_pictures.message}
          />
        </div>

        {/* Routes Card - Full Width */}
        <div className="cls_routes_section mb-6">
          <RoutesCard routes={health_data.checks.routes} />
        </div>

        {/* Recommendations */}
        <RecommendationsList recommendations={health_data.recommendations} />

        {/* Documentation Link */}
        <div className="cls_docs_link mt-8 text-center">
          <a
            href="https://github.com/your-repo/hazo_auth/blob/main/SETUP_CHECKLIST.md"
            target="_blank"
            rel="noopener noreferrer"
            className="cls_docs_link_text inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            View Full Setup Documentation
          </a>
        </div>
      </div>
    </div>
  );
}

