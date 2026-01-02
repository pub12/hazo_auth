// file_description: service for sending emails with template support
// section: imports
import fs from "fs";
import path from "path";
import { create_app_logger } from "../app_logger.js";
import { read_config_section } from "../config/config_loader.server.js";
// section: constants
const DEFAULT_EMAIL_FROM = "noreply@hazo_auth.local";
/**
 * Gets the default email template directory (lazy-evaluated to avoid Edge Runtime issues)
 */
function get_default_email_template_dir() {
    return path.resolve(process.cwd(), "email_templates");
}
// section: singleton
/**
 * Singleton instance for hazo_notify emailer configuration
 * This is initialized once in instrumentation.ts and reused across all email sends
 */
let hazo_notify_config = null;
/**
 * Sets the hazo_notify emailer configuration instance
 * This is called from instrumentation.ts during initialization
 * @param config - The hazo_notify emailer configuration instance
 */
export function set_hazo_notify_instance(config) {
    hazo_notify_config = config;
}
/**
 * Gets the hazo_notify emailer configuration instance
 * If not set, loads it from config file as fallback
 * @returns The hazo_notify emailer configuration instance
 */
async function get_hazo_notify_instance() {
    if (!hazo_notify_config) {
        // Fallback: load from config file if not initialized
        const logger = create_app_logger();
        logger.warn("hazo_notify_instance_not_initialized", {
            filename: "email_service.ts",
            line_number: 0,
            note: "hazo_notify instance not initialized in instrumentation.ts, loading from config file as fallback",
        });
        try {
            // Dynamic import to avoid build-time issues with hazo_notify
            const hazo_notify_module = await import("hazo_notify");
            const { load_emailer_config } = hazo_notify_module;
            hazo_notify_config = load_emailer_config();
        }
        catch (error) {
            const error_message = error instanceof Error ? error.message : "Unknown error";
            logger.error("hazo_notify_config_load_failed", {
                filename: "email_service.ts",
                line_number: 0,
                error: error_message,
            });
            throw new Error(`Failed to load hazo_notify config: ${error_message}`);
        }
    }
    return hazo_notify_config;
}
// section: helpers
/**
 * Gets email template directory from config
 * @returns Email template directory path
 */
function get_email_template_directory() {
    const email_section = read_config_section("hazo_auth__email");
    const template_dir = email_section === null || email_section === void 0 ? void 0 : email_section.email_template_main_directory;
    if (template_dir) {
        return path.isAbsolute(template_dir)
            ? template_dir
            : path.resolve(process.cwd(), template_dir);
    }
    return get_default_email_template_dir();
}
/**
 * Gets email from address from config
 * Priority: 1. hazo_auth__email.from_email, 2. hazo_notify_config.from_email
 * @param notify_config - The hazo_notify configuration instance (for fallback)
 * @returns Email from address
 */
async function get_email_from(notify_config) {
    const email_section = read_config_section("hazo_auth__email");
    const hazo_auth_from_email = email_section === null || email_section === void 0 ? void 0 : email_section.from_email;
    // If set in hazo_auth_config.ini, use it (overrides hazo_notify config)
    if (hazo_auth_from_email) {
        return hazo_auth_from_email;
    }
    // Fall back to hazo_notify config
    return notify_config.from_email;
}
/**
 * Gets email from name from config
 * Priority: 1. hazo_auth__email.from_name, 2. hazo_notify_config.from_name
 * @param notify_config - The hazo_notify configuration instance (for fallback)
 * @returns Email from name
 */
async function get_email_from_name(notify_config) {
    const email_section = read_config_section("hazo_auth__email");
    const hazo_auth_from_name = email_section === null || email_section === void 0 ? void 0 : email_section.from_name;
    // If set in hazo_auth_config.ini, use it (overrides hazo_notify config)
    if (hazo_auth_from_name) {
        return hazo_auth_from_name;
    }
    // Fall back to hazo_notify config
    return notify_config.from_name;
}
/**
 * Gets base URL for email links from config or environment variable
 * Priority: 1. hazo_auth__email.base_url, 2. APP_DOMAIN_NAME, 3. NEXT_PUBLIC_APP_URL/APP_URL
 * @returns Base URL for email links
 */
function get_base_url() {
    const email_section = read_config_section("hazo_auth__email");
    const base_url = email_section === null || email_section === void 0 ? void 0 : email_section.base_url;
    if (base_url) {
        return base_url.endsWith("/") ? base_url.slice(0, -1) : base_url;
    }
    // Try to get from APP_DOMAIN_NAME environment variable (adds protocol if needed)
    const app_domain_name = process.env.APP_DOMAIN_NAME;
    if (app_domain_name) {
        // Ensure protocol is included (default to https if not specified)
        const domain = app_domain_name.trim();
        if (domain.startsWith("http://") || domain.startsWith("https://")) {
            return domain.endsWith("/") ? domain.slice(0, -1) : domain;
        }
        // If no protocol, default to https
        return `https://${domain}`;
    }
    // Try to get from other environment variables (fallback)
    const env_base_url = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
    if (env_base_url) {
        return env_base_url.endsWith("/") ? env_base_url.slice(0, -1) : env_base_url;
    }
    // Default to empty string (will use relative URLs)
    return "";
}
/**
 * Constructs verification URL from token
 * @param token - Verification token
 * @returns Verification URL
 */
function get_verification_url(token) {
    const base_url = get_base_url();
    const path = "/hazo_auth/verify_email";
    const url = base_url ? `${base_url}${path}?token=${encodeURIComponent(token)}` : `${path}?token=${encodeURIComponent(token)}`;
    return url;
}
/**
 * Constructs reset password URL from token
 * @param token - Password reset token
 * @returns Reset password URL
 */
function get_reset_password_url(token) {
    const base_url = get_base_url();
    const path = "/hazo_auth/reset_password";
    const url = base_url ? `${base_url}${path}?token=${encodeURIComponent(token)}` : `${path}?token=${encodeURIComponent(token)}`;
    return url;
}
/**
 * Gets default HTML template for a given template type
 * @param template_type - Type of email template
 * @param data - Template data for variable substitution
 * @returns Default HTML template content
 */
function get_default_html_template(template_type, data) {
    switch (template_type) {
        case "email_verification":
            return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #0f172a;">Verify Your Email Address</h1>
  <p>Thank you for registering! Please click the link below to verify your email address:</p>
  <p style="margin: 20px 0;">
    <a href="${data.verification_url || "#"}" style="display: inline-block; padding: 12px 24px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 4px;">Verify Email Address</a>
  </p>
  <p>Or copy and paste this link into your browser:</p>
  <p style="word-break: break-all; color: #666;">${data.verification_url || data.token || ""}</p>
  <p>This link will expire in 48 hours.</p>
  <p style="margin-top: 30px; color: #666; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
</body>
</html>
      `.trim();
        case "forgot_password":
            return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #0f172a;">Reset Your Password</h1>
  <p>We received a request to reset your password. Click the link below to reset it:</p>
  <p style="margin: 20px 0;">
    <a href="${data.reset_url || "#"}" style="display: inline-block; padding: 12px 24px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 4px;">Reset Password</a>
  </p>
  <p>Or copy and paste this link into your browser:</p>
  <p style="word-break: break-all; color: #666;">${data.reset_url || data.token || ""}</p>
  <p>This link will expire in 10 minutes.</p>
  <p style="margin-top: 30px; color: #666; font-size: 12px;">If you didn't request a password reset, you can safely ignore this email.</p>
</body>
</html>
      `.trim();
        case "password_changed":
            return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Password Changed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #0f172a;">Password Changed Successfully</h1>
  <p>Hello${data.user_name ? ` ${data.user_name}` : ""},</p>
  <p>This email confirms that your password has been changed successfully.</p>
  <p>If you did not make this change, please contact support immediately to secure your account.</p>
  <p style="margin-top: 30px; color: #666; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
</body>
</html>
      `.trim();
        default:
            return "<p>Email content</p>";
    }
}
/**
 * Gets default text template for a given template type
 * @param template_type - Type of email template
 * @param data - Template data for variable substitution
 * @returns Default text template content
 */
function get_default_text_template(template_type, data) {
    switch (template_type) {
        case "email_verification":
            return `
Verify Your Email Address

Thank you for registering! Please click the link below to verify your email address:

${data.verification_url || data.token || ""}

This link will expire in 48 hours.

If you didn't create an account, you can safely ignore this email.
      `.trim();
        case "forgot_password":
            return `
Reset Your Password

We received a request to reset your password. Click the link below to reset it:

${data.reset_url || data.token || ""}

This link will expire in 10 minutes.

If you didn't request a password reset, you can safely ignore this email.
      `.trim();
        case "password_changed":
            return `
Password Changed Successfully

Hello${data.user_name ? ` ${data.user_name}` : ""},

This email confirms that your password has been changed successfully.

If you did not make this change, please contact support immediately to secure your account.

This is an automated notification. Please do not reply to this email.
      `.trim();
        default:
            return "Email content";
    }
}
/**
 * Loads email template from file system
 * @param template_type - Type of email template
 * @param extension - File extension (html or txt)
 * @returns Template content or undefined if not found
 */
function load_template_file(template_type, extension) {
    const template_dir = get_email_template_directory();
    const template_filename = `${template_type}.${extension}`;
    const template_path = path.join(template_dir, template_filename);
    if (!fs.existsSync(template_path)) {
        return undefined;
    }
    try {
        return fs.readFileSync(template_path, "utf-8");
    }
    catch (error) {
        const logger = create_app_logger();
        logger.error("email_service_template_load_failed", {
            filename: "email_service.ts",
            line_number: 0,
            template_path,
            error: error instanceof Error ? error.message : "Unknown error",
        });
        return undefined;
    }
}
/**
 * Simple template variable substitution
 * Replaces {{variable_name}} with values from data object
 * @param template - Template string with variables
 * @param data - Data object for variable substitution
 * @returns Template with variables substituted
 */
function substitute_template_variables(template, data) {
    let result = template;
    // Replace {{variable}} with values from data
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
            result = result.replace(regex, value);
        }
    });
    return result;
}
/**
 * Gets email subject for a given template type
 * @param template_type - Type of email template
 * @returns Email subject
 */
function get_email_subject(template_type) {
    const email_section = read_config_section("hazo_auth__email");
    const template_config_key = `email_template__${template_type}`;
    const subject_key = `${template_config_key}__subject`;
    // Try to get subject from config
    const subject = email_section === null || email_section === void 0 ? void 0 : email_section[subject_key];
    if (subject) {
        return subject;
    }
    // Default subjects
    switch (template_type) {
        case "email_verification":
            return "Verify Your Email Address";
        case "forgot_password":
            return "Reset Your Password";
        case "password_changed":
            return "Password Changed Successfully";
        default:
            return "Email from hazo_auth";
    }
}
/**
 * Gets email templates (HTML and text) for a given template type
 * Falls back to default templates if custom templates are not found
 * @param template_type - Type of email template
 * @param data - Template data for variable substitution
 * @returns Object with html_body and text_body
 */
function get_email_templates(template_type, data) {
    // Try to load custom templates
    const html_template = load_template_file(template_type, "html");
    const text_template = load_template_file(template_type, "txt");
    // Use custom templates if found, otherwise use defaults
    const html_body = html_template
        ? substitute_template_variables(html_template, data)
        : get_default_html_template(template_type, data);
    const text_body = text_template
        ? substitute_template_variables(text_template, data)
        : get_default_text_template(template_type, data);
    return { html_body, text_body };
}
/**
 * Sends an email using hazo_notify
 * @param options - Email options (to, from, subject, html_body, text_body)
 * @returns Promise that resolves when email is sent
 */
export async function send_email(options) {
    const logger = create_app_logger();
    try {
        // Get hazo_notify configuration instance
        const notify_config = await get_hazo_notify_instance();
        // Dynamic import to avoid build-time issues with hazo_notify
        const hazo_notify_module = await import("hazo_notify");
        const { send_email: hazo_notify_send_email } = hazo_notify_module;
        // Get from email and from name (hazo_auth_config overrides hazo_notify_config)
        // Priority: 1. options.from (explicit parameter), 2. hazo_auth_config.from_email, 3. hazo_notify_config.from_email
        const from_email = options.from || await get_email_from(notify_config);
        const from_name = await get_email_from_name(notify_config);
        // Prepare hazo_notify email options
        const hazo_notify_options = {
            to: options.to,
            subject: options.subject,
            content: Object.assign(Object.assign({}, (options.html_body && { html: options.html_body })), (options.text_body && { text: options.text_body })),
            // Use from_email and from_name (hazo_notify will use these instead of config defaults)
            from: from_email,
            from_name: from_name,
        };
        // Send email using hazo_notify
        const result = await hazo_notify_send_email(hazo_notify_options, notify_config);
        if (result.success) {
            logger.info("email_sent", {
                filename: "email_service.ts",
                line_number: 0,
                to: options.to,
                from: options.from || notify_config.from_email,
                subject: options.subject,
                message_id: result.message_id,
            });
            return { success: true };
        }
        else {
            const error_message = result.error || result.message || "Unknown error";
            logger.error("email_send_failed", {
                filename: "email_service.ts",
                line_number: 0,
                to: options.to,
                from: options.from || notify_config.from_email,
                subject: options.subject,
                error: error_message,
                raw_response: result.raw_response,
            });
            return { success: false, error: error_message };
        }
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        logger.error("email_send_failed", {
            filename: "email_service.ts",
            line_number: 0,
            to: options.to,
            from: options.from,
            subject: options.subject,
            error: error_message,
        });
        return { success: false, error: error_message };
    }
}
/**
 * Sends an email using a template
 * @param template_type - Type of email template
 * @param to - Recipient email address
 * @param data - Template data for variable substitution
 * @returns Promise that resolves when email is sent
 */
export async function send_template_email(template_type, to, data) {
    const logger = create_app_logger();
    try {
        // Enhance data with URLs if token is provided
        const enhanced_data = Object.assign({}, data);
        if (data.token) {
            if (template_type === "email_verification") {
                enhanced_data.verification_url = get_verification_url(data.token);
            }
            else if (template_type === "forgot_password") {
                enhanced_data.reset_url = get_reset_password_url(data.token);
            }
        }
        // Get email templates
        const { html_body, text_body } = get_email_templates(template_type, enhanced_data);
        // Get email subject
        const subject = get_email_subject(template_type);
        // Get hazo_notify config instance
        const notify_config = await get_hazo_notify_instance();
        // Get email from address and from name
        // Priority: 1. hazo_auth_config.from_email/from_name, 2. hazo_notify_config.from_email/from_name
        const from = await get_email_from(notify_config);
        // Send email (from_name is handled inside send_email function)
        return await send_email({
            to,
            from,
            subject,
            html_body,
            text_body,
        });
    }
    catch (error) {
        const error_message = error instanceof Error ? error.message : "Unknown error";
        logger.error("email_template_send_failed", {
            filename: "email_service.ts",
            line_number: 0,
            template_type,
            to,
            error: error_message,
        });
        return { success: false, error: error_message };
    }
}
