// file_description: provide shared utility helpers for the hazo_auth project
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
// section: tailwind_merge_helper
export function merge_class_names(...inputs) {
    return twMerge(clsx(inputs));
}
// section: shadcn_compatibility_helper
export const cn = (...inputs) => merge_class_names(...inputs);
