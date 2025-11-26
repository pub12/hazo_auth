import type { EmailerConfig } from "hazo_notify";
export type EmailOptions = {
    to: string;
    from: string;
    subject: string;
    html_body?: string;
    text_body?: string;
};
export type EmailTemplateType = "forgot_password" | "email_verification" | "password_changed";
export type EmailTemplateData = {
    token?: string;
    verification_url?: string;
    reset_url?: string;
    user_email?: string;
    user_name?: string;
    [key: string]: string | undefined;
};
/**
 * Sets the hazo_notify emailer configuration instance
 * This is called from instrumentation.ts during initialization
 * @param config - The hazo_notify emailer configuration instance
 */
export declare function set_hazo_notify_instance(config: EmailerConfig): void;
/**
 * Sends an email using hazo_notify
 * @param options - Email options (to, from, subject, html_body, text_body)
 * @returns Promise that resolves when email is sent
 */
export declare function send_email(options: EmailOptions): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Sends an email using a template
 * @param template_type - Type of email template
 * @param to - Recipient email address
 * @param data - Template data for variable substitution
 * @returns Promise that resolves when email is sent
 */
export declare function send_template_email(template_type: EmailTemplateType, to: string, data: EmailTemplateData): Promise<{
    success: boolean;
    error?: string;
}>;
//# sourceMappingURL=email_service.d.ts.map