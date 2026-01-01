import { jsx as _jsx } from "react/jsx-runtime";
// file_description: zero-config page component for create firm
// section: imports
import CreateFirmLayout from "../components/layouts/create_firm/index";
import { AuthPageShell } from "../components/layouts/shared/components/auth_page_shell";
import { get_config_value } from "../lib/config/config_loader.server";
// section: config_loader
function get_create_firm_config() {
    return {
        image_src: get_config_value("hazo_auth__create_firm", "image_src", "/hazo_auth/images/new_firm_default.jpg"),
        heading: get_config_value("hazo_auth__create_firm", "heading", "Create Your Firm"),
        sub_heading: get_config_value("hazo_auth__create_firm", "sub_heading", "Set up your organisation to get started"),
        firm_name_label: get_config_value("hazo_auth__create_firm", "firm_name_label", "Firm Name"),
        org_structure_label: get_config_value("hazo_auth__create_firm", "org_structure_label", "Organisation Structure"),
        org_structure_default: get_config_value("hazo_auth__create_firm", "org_structure_default", "Headquarters"),
        submit_button_label: get_config_value("hazo_auth__create_firm", "submit_button_label", "Create Firm"),
        success_message: get_config_value("hazo_auth__create_firm", "success_message", "Your firm has been created successfully!"),
        redirect_route: get_config_value("hazo_auth__create_firm", "redirect_route", "/"),
    };
}
// section: component
export default function CreateFirmPage({ disableNavbar } = {}) {
    const config = get_create_firm_config();
    const layoutContent = (_jsx(CreateFirmLayout, { image_src: config.image_src, heading: config.heading, sub_heading: config.sub_heading, firm_name_label: config.firm_name_label, org_structure_label: config.org_structure_label, default_org_structure: config.org_structure_default, submit_button_label: config.submit_button_label, success_message: config.success_message, redirect_route: config.redirect_route }));
    if (disableNavbar) {
        return layoutContent;
    }
    return _jsx(AuthPageShell, { children: layoutContent });
}
// section: exports
export { CreateFirmPage };
