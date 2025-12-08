import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// file_description: reusable two-column authentication layout shell that combines visual panel and form content
// section: imports
import { VisualPanel } from "./visual_panel";
// section: component
export function TwoColumnAuthLayout({ imageSrc, imageAlt, imageBackgroundColor, formContent, className, visualPanelClassName, formContainerClassName, }) {
    return (_jsxs("div", { className: `cls_two_column_auth_layout mx-4 my-8 grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:mx-auto md:my-12 md:grid-cols-2 md:min-h-[520px] ${className !== null && className !== void 0 ? className : ""}`, children: [_jsx(VisualPanel, { imageSrc: imageSrc, imageAlt: imageAlt, backgroundColor: imageBackgroundColor, className: visualPanelClassName }), _jsx("div", { className: `cls_two_column_auth_layout_form_container flex flex-col gap-6 p-8 ${formContainerClassName !== null && formContainerClassName !== void 0 ? formContainerClassName : ""}`, children: formContent })] }));
}
