import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// section: component
export function FormHeader({ heading, subHeading, className, headingClassName, subHeadingClassName, }) {
    return (_jsxs("header", { className: `cls_form_header flex flex-col gap-2 text-center md:text-left ${className !== null && className !== void 0 ? className : ""}`, children: [_jsx("h1", { className: `cls_form_header_title text-2xl font-semibold text-slate-900 ${headingClassName !== null && headingClassName !== void 0 ? headingClassName : ""}`, children: heading }), _jsx("p", { className: `cls_form_header_subtitle text-sm text-slate-600 ${subHeadingClassName !== null && subHeadingClassName !== void 0 ? subHeadingClassName : ""}`, children: subHeading })] }));
}
