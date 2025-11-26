// file_description: shared helper functions for API routes to get filename and line number
// section: helpers
/**
 * Gets the filename from the call stack
 * This is a simplified version that extracts the filename from the error stack
 * @returns Filename or "route.ts" as default
 */
export function get_filename() {
    try {
        const stack = new Error().stack;
        if (!stack) {
            return "route.ts";
        }
        // Parse stack trace to find the caller's file
        const lines = stack.split("\n");
        // Skip Error line and get_filename line, get the actual caller
        for (let i = 2; i < lines.length; i++) {
            const line = lines[i];
            // Match file paths in stack trace (e.g., "at /path/to/file.ts:123:45")
            const match = line.match(/([^/\\]+\.tsx?):(\d+):(\d+)/);
            if (match) {
                return match[1];
            }
        }
        return "route.ts";
    }
    catch (_a) {
        return "route.ts";
    }
}
/**
 * Gets the line number from the call stack
 * This is a simplified version that extracts the line number from the error stack
 * @returns Line number or 0
 */
export function get_line_number() {
    try {
        const stack = new Error().stack;
        if (!stack) {
            return 0;
        }
        // Parse stack trace to find the caller's line number
        const lines = stack.split("\n");
        // Skip Error line and get_line_number line, get the actual caller
        for (let i = 2; i < lines.length; i++) {
            const line = lines[i];
            // Match line numbers in stack trace (e.g., "at /path/to/file.ts:123:45")
            const match = line.match(/([^/\\]+\.tsx?):(\d+):(\d+)/);
            if (match) {
                return parseInt(match[2], 10) || 0;
            }
        }
        return 0;
    }
    catch (_a) {
        return 0;
    }
}
