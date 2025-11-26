import type { app_context, captcha_settings, logger_service, password_policy, rate_limit_settings, runtime_configuration, token_settings } from "hazo_auth/server/types/app_types";
type direct_configuration_input = {
    permission_names?: string[];
    templates?: Record<string, string>;
    labels?: Record<string, string>;
    styles?: Record<string, string>;
    emailer?: resolved_emailer_options;
    logger?: logger_service;
    password_policy?: Partial<password_policy>;
    token_settings?: Partial<token_settings>;
    rate_limit?: Partial<rate_limit_settings>;
    captcha?: captcha_settings;
};
export type configuration_options = {
    config_file_path?: string;
    direct_configuration?: direct_configuration_input;
};
type resolved_emailer_options = {
    base_url: string;
    api_key?: string;
    headers?: Record<string, string>;
};
export declare const load_runtime_configuration: (options?: configuration_options) => runtime_configuration;
export declare const create_app_context: (options?: configuration_options) => app_context;
export {};
//# sourceMappingURL=config_loader.d.ts.map