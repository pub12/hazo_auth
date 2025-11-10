// file_description: provide shared utility helpers for the ui_component project
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// section: tailwind_merge_helper
export function merge_class_names(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// section: shadcn_compatibility_helper
export const cn = (...inputs: ClassValue[]) => merge_class_names(...inputs);
