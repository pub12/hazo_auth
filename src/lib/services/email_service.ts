// file_description: service for sending emails with template support
// section: imports
import fs from "fs";
import path from "path";
import { create_app_logger } from "../app_logger";
import { read_config_section } from "../config/config_loader.server";

// section: types
export type EmailOptions = {
  to: string;
  from: string;
  subject: string;
  html_body?: string;
  text_body?: string;
};

export type EmailTemplateType = "forgot_password" | "email_verification";

export type EmailTemplateData = {
  token?: string;
  verification_url?: string;
  reset_url?: string;
  user_email?: string;
  user_name?: string;
  [key: string]: string | undefined;
};

// section: constants
const DEFAULT_EMAIL_FROM = "noreply@hazo_auth.local";
const DEFAULT_EMAIL_TEMPLATE_DIR = path.resolve(process.cwd(), "email_templates");

// section: helpers
/**
 * Gets email template directory from config
 * @returns Email template directory path
 */
function get_email_template_directory(): string {
  const email_section = read_config_section("hazo_auth__email");
  const template_dir = email_section?.email_template_main_directory;
  
  if (template_dir) {
    return path.isAbsolute(template_dir)
      ? template_dir
      : path.resolve(process.cwd(), template_dir);
  }
  
  return DEFAULT_EMAIL_TEMPLATE_DIR;
}

/**
 * Gets email from address from config
 * @returns Email from address
 */
function get_email_from(): string {
  const email_section = read_config_section("hazo_auth__email");
  return email_section?.email_from || DEFAULT_EMAIL_FROM;
}

/**
 * Gets base URL for email links from config
 * @returns Base URL for email links
 */
function get_base_url(): string {
  const email_section = read_config_section("hazo_auth__email");
  const base_url = email_section?.base_url;
  
  if (base_url) {
    return base_url.endsWith("/") ? base_url.slice(0, -1) : base_url;
  }
  
  // Try to get from environment variable
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
function get_verification_url(token: string): string {
  const base_url = get_base_url();
  const path = "/verify_email";
  const url = base_url ? `${base_url}${path}?token=${encodeURIComponent(token)}` : `${path}?token=${encodeURIComponent(token)}`;
  return url;
}

/**
 * Constructs reset password URL from token
 * @param token - Password reset token
 * @returns Reset password URL
 */
function get_reset_password_url(token: string): string {
  const base_url = get_base_url();
  const path = "/reset_password";
  const url = base_url ? `${base_url}${path}?token=${encodeURIComponent(token)}` : `${path}?token=${encodeURIComponent(token)}`;
  return url;
}

/**
 * Gets default HTML template for a given template type
 * @param template_type - Type of email template
 * @param data - Template data for variable substitution
 * @returns Default HTML template content
 */
function get_default_html_template(
  template_type: EmailTemplateType,
  data: EmailTemplateData
): string {
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
function get_default_text_template(
  template_type: EmailTemplateType,
  data: EmailTemplateData
): string {
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
function load_template_file(
  template_type: EmailTemplateType,
  extension: "html" | "txt"
): string | undefined {
  const template_dir = get_email_template_directory();
  const template_filename = `${template_type}.${extension}`;
  const template_path = path.join(template_dir, template_filename);
  
  if (!fs.existsSync(template_path)) {
    return undefined;
  }
  
  try {
    return fs.readFileSync(template_path, "utf-8");
  } catch (error) {
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
function substitute_template_variables(
  template: string,
  data: EmailTemplateData
): string {
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
function get_email_subject(template_type: EmailTemplateType): string {
  const email_section = read_config_section("hazo_auth__email");
  const template_config_key = `email_template__${template_type}`;
  const subject_key = `${template_config_key}__subject`;
  
  // Try to get subject from config
  const subject = email_section?.[subject_key];
  if (subject) {
    return subject;
  }
  
  // Default subjects
  switch (template_type) {
    case "email_verification":
      return "Verify Your Email Address";
    case "forgot_password":
      return "Reset Your Password";
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
function get_email_templates(
  template_type: EmailTemplateType,
  data: EmailTemplateData
): { html_body: string; text_body: string } {
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
 * Sends an email (currently outputs to console)
 * @param options - Email options (to, from, subject, html_body, text_body)
 * @returns Promise that resolves when email is sent
 */
export async function send_email(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const logger = create_app_logger();
  
  try {
    // For now, just output to console
    console.log("=".repeat(80));
    console.log("EMAIL OUTPUT");
    console.log("=".repeat(80));
    console.log("From:", options.from);
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log("-".repeat(80));
    console.log("HTML Body:");
    console.log(options.html_body || "(no HTML body)");
    console.log("-".repeat(80));
    console.log("Text Body:");
    console.log(options.text_body || "(no text body)");
    console.log("=".repeat(80));
    
    logger.info("email_sent", {
      filename: "email_service.ts",
      line_number: 0,
      to: options.to,
      from: options.from,
      subject: options.subject,
    });
    
    return { success: true };
  } catch (error) {
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
export async function send_template_email(
  template_type: EmailTemplateType,
  to: string,
  data: EmailTemplateData
): Promise<{ success: boolean; error?: string }> {
  const logger = create_app_logger();
  
  try {
    // Enhance data with URLs if token is provided
    const enhanced_data: EmailTemplateData = { ...data };
    
    if (data.token) {
      if (template_type === "email_verification") {
        enhanced_data.verification_url = get_verification_url(data.token);
      } else if (template_type === "forgot_password") {
        enhanced_data.reset_url = get_reset_password_url(data.token);
      }
    }
    
    // Get email templates
    const { html_body, text_body } = get_email_templates(template_type, enhanced_data);
    
    // Get email subject
    const subject = get_email_subject(template_type);
    
    // Get email from address
    const from = get_email_from();
    
    // Send email
    return await send_email({
      to,
      from,
      subject,
      html_body,
      text_body,
    });
  } catch (error) {
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

