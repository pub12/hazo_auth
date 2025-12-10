/**
 * Custom field to display in the hover card
 */
export type ProfileStampCustomField = {
    label: string;
    value: string;
};
/**
 * Props for the ProfileStamp component
 */
export type ProfileStampProps = {
    /**
     * Size variant for the avatar
     * - sm: h-6 w-6 (24px)
     * - default: h-8 w-8 (32px)
     * - lg: h-10 w-10 (40px)
     */
    size?: "sm" | "default" | "lg";
    /**
     * Custom fields to display in the hover card
     */
    custom_fields?: ProfileStampCustomField[];
    /**
     * Additional CSS classes to apply to the wrapper
     */
    className?: string;
    /**
     * Whether to show the user's name in the hover card (default: true)
     */
    show_name?: boolean;
    /**
     * Whether to show the user's email in the hover card (default: true)
     */
    show_email?: boolean;
};
/**
 * ProfileStamp component - displays a circular profile picture with a hover card
 * showing the user's name, email, and any custom fields.
 *
 * Use this component to add profile attribution to notes, comments, or any
 * user-generated content in your application.
 *
 * @example
 * // Basic usage
 * <ProfileStamp />
 *
 * @example
 * // With custom fields
 * <ProfileStamp
 *   size="lg"
 *   custom_fields={[
 *     { label: "Role", value: "Admin" },
 *     { label: "Department", value: "Engineering" }
 *   ]}
 * />
 */
export declare function ProfileStamp({ size, custom_fields, className, show_name, show_email, }: ProfileStampProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=profile_stamp.d.ts.map