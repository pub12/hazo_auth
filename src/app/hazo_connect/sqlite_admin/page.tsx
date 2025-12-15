import { getSqliteAdminService } from "hazo_connect/server"
import { getHazoConnectSingleton } from "hazo_connect/nextjs/setup"
import { SqliteAdminClient } from "hazo_connect/ui"

export const dynamic = "force-dynamic"

export default async function SqliteAdminPage() {
  // Initialize the singleton to ensure the adapter is registered with the admin service
  getHazoConnectSingleton()
  const service = getSqliteAdminService()
 
  try {
    const tables = await service.listTables()
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

