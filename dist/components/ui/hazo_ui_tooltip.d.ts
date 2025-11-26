export type HazoUITooltipProps = {
    /**
     * The tooltip message to display
     */
    message: string;
    /**
     * Optional custom icon size (default: 16)
     */
    iconSize?: number;
    /**
     * Optional custom icon className
     */
    iconClassName?: string;
    /**
     * Optional side for tooltip placement (default: "top")
     */
    side?: "top" | "right" | "bottom" | "left";
};
/**
 * Reusable tooltip component with question mark icon
 * Displays a help icon that shows a tooltip message on hover
 * @param props - Component props including message, icon size, and placement
 * @returns Tooltip component with question mark icon
 */
export declare function HazoUITooltip({ message, iconSize, iconClassName, side, }: HazoUITooltipProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=hazo_ui_tooltip.d.ts.map