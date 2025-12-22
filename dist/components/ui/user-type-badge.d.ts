export type UserTypeBadgeProps = {
    /** Display label for the badge */
    label: string;
    /** Color - preset name (blue, green, red, etc.) or hex value (#4CAF50) */
    color: string;
    /** Additional CSS classes */
    className?: string;
};
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
export declare function UserTypeBadge({ label, color, className }: UserTypeBadgeProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=user-type-badge.d.ts.map