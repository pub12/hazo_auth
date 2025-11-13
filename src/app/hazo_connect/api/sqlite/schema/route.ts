// file_description: API route to get SQLite table schema for admin UI
import { NextRequest, NextResponse } from "next/server"
import { getSqliteAdminService } from "hazo_connect/server"
import { get_hazo_connect_instance } from "@/lib/hazo_connect_instance.server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const table = url.searchParams.get("table")
  if (!table) {
    return NextResponse.json(
      { error: "Query parameter 'table' is required." },
      { status: 400 }
    )
  }

  try {
    // Get singleton hazo_connect instance (initializes admin service if needed)
    get_hazo_connect_instance();
    
    const service = getSqliteAdminService()
    const schema = await service.getTableSchema(table)
    return NextResponse.json({ data: schema })
  } catch (error) {
    return toErrorResponse(error, `Failed to fetch schema for table '${table}'`)
  }
}

function toErrorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback
  const status = message.toLowerCase().includes("required") ? 400 : 500
  return NextResponse.json({ error: message }, { status })
}

