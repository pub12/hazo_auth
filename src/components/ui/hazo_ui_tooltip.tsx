// file_description: reusable tooltip component for hazo_auth with question mark icon
// section: client_directive
"use client";

// section: imports
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

// section: types
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

// section: component
/**
 * Reusable tooltip component with question mark icon
 * Displays a help icon that shows a tooltip message on hover
 * @param props - Component props including message, icon size, and placement
 * @returns Tooltip component with question mark icon
 */
export function HazoUITooltip({
  message,
  iconSize = 16,
  iconClassName = "text-slate-400 hover:text-slate-600",
  side = "top",
}: HazoUITooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="cls_hazo_ui_tooltip_trigger inline-flex items-start focus:outline-none align-super"
            aria-label="Help"
            style={{ verticalAlign: "super" }}
          >
            <HelpCircle
              size={iconSize}
              className={`cls_hazo_ui_tooltip_icon ${iconClassName}`}
              aria-hidden="true"
              style={{ transform: "translateY(-0.2em)" }}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="cls_hazo_ui_tooltip_content">
          <p className="cls_hazo_ui_tooltip_message">{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

