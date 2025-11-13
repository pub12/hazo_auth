// file_description: SQLite admin UI page that displays the admin client component
// Note: This page fetches data from API routes instead of directly calling admin service
// to avoid SQLite/WASM loading issues in React Server Component context
import { headers } from "next/headers"
import type { TableSummary } from "hazo_connect/ui"
import SqliteAdminClient from "./sqlite-admin-client"

export const dynamic = "force-dynamic"

export default async function SqliteAdminPage() {
  // Fetch initial tables from API route to avoid SQLite/WASM in RSC context
  // API routes run in proper Node.js context where SQLite can work
  try {
    // Get the host from request headers to construct absolute URL
    const headersList = await headers()
    const host = headersList.get("host") || "localhost:3000"
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
    const baseUrl = `${protocol}://${host}`
    
    // Use Next.js internal fetch with absolute URL
    const response = await fetch(
      `${baseUrl}/hazo_connect/api/sqlite/tables`,
      { 
        cache: "no-store"
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch tables: ${response.statusText}`);
    }
    
    const data = await response.json();
    const tables: TableSummary[] = data.data || [];
    
    return <SqliteAdminClient initialTables={tables} />
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to initialise SQLite admin UI."

    return (
      <section className="mx-auto flex max-w-4xl flex-col gap-4 p-6">
        <h1 className="text-2xl font-semibold text-slate-900">SQLite Admin</h1>
        <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {message}
        </p>
      </section>
    )
  }
}

