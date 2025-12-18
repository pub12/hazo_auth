import type { Request } from "express";
import type { Logger, LogData } from "hazo_logs";
export type logger_method = (message: string, data?: LogData) => void;
export type logger_service = Logger;
export type emailer_client = {
    send_message: (payload: Record<string, unknown>) => Promise<{
        success: boolean;
    }>;
};
export type handlebars_templates = Record<string, string>;
export type password_policy = {
    min_length: number;
    requires_uppercase: boolean;
    requires_lowercase: boolean;
    requires_number: boolean;
    requires_symbol: boolean;
};
export type token_settings = {
    access_token_ttl_seconds: number;
    refresh_token_ttl_seconds: number;
};
export type rate_limit_settings = {
    max_attempts: number;
    window_minutes: number;
};
export type captcha_settings = {
    provider: "recaptcha_v2" | "recaptcha_v3" | "hcaptcha";
    secret_key: string;
} | undefined;
export type runtime_configuration = {
    permission_names: string[];
    logger: logger_service;
    emailer: emailer_client;
    templates: handlebars_templates;
    labels: Record<string, string>;
    styles: Record<string, string>;
    password_policy: password_policy;
    token_settings: token_settings;
    rate_limit: rate_limit_settings;
    captcha: captcha_settings;
};
export type app_context = {
    config: runtime_configuration;
};
export type context_request<T = unknown> = Request & {
    body: T;
    context: app_context;
};
//# sourceMappingURL=app_types.d.ts.map