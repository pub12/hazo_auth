// file_description: API route to list SQLite tables for admin UI
import { NextResponse } from "next/server"
import { getSqliteAdminService } from "hazo_connect/server"
import { get_hazo_connect_instance } from "@/lib/hazo_connect_instance.server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Get singleton hazo_connect instance (initializes admin service if needed)
    get_hazo_connect_instance();
    
    const service = getSqliteAdminService()
    const tables = await service.listTables()
    return NextResponse.json({ data: tables })
  } catch (error) {
    return toErrorResponse(error, "Failed to list SQLite tables")
  }
}

function toErrorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback
  const status = message.toLowerCase().includes("required") ? 400 : 500
  return NextResponse.json({ error: message }, { status })
}

