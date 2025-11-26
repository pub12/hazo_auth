import type { HazoConnectAdapter } from "hazo_connect";
/**
 * Applies a SQL migration file to the database
 * For SQLite, we need to execute raw SQL statements
 * @param adapter - The hazo_connect adapter instance
 * @param migration_file_path - Path to the SQL migration file
 * @returns Success status and error message if any
 */
export declare function apply_migration(adapter: HazoConnectAdapter, migration_file_path: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Applies all migrations in the migrations directory
 * @param adapter - The hazo_connect adapter instance
 * @returns Success status and error message if any
 */
export declare function apply_all_migrations(adapter: HazoConnectAdapter): Promise<{
    success: boolean;
    error?: string;
}>;
//# sourceMappingURL=apply_migration.d.ts.map