// file_description: Badge component for displaying user types with configurable colors
"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../../lib/utils";
// section: constants
const PRESET_COLOR_CLASSES = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    pink: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
};
// section: component
/**
 * UserTypeBadge - Displays a styled badge for user types
 *
 * Supports preset colors (blue, green, red, yellow, purple, gray, orange, pink)
 * and custom hex colors (e.g., #4CAF50).
 *
 * @example
 * // Using preset color
 * <UserTypeBadge label="Administrator" color="red" />
 *
 * // Using custom hex color
 * <UserTypeBadge label="VIP" color="#FFD700" />
 */
export function UserTypeBadge({ label, color, className }) {
    const isPreset = color in PRESET_COLOR_CLASSES;
    if (isPreset) {
        return (_jsx("span", { className: cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", PRESET_COLOR_CLASSES[color], className), children: label }));
    }
    // Custom hex color - use lighter bg with the color as text
    // Calculate a semi-transparent background from the hex color
    const style = {
        backgroundColor: `${color}20`, // 20 = ~12% opacity in hex
        color: color,
    };
    return (_jsx("span", { className: cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", className), style: style, children: label }));
}
