// file_description: bootstrap configuration handling for the hazo_auth server
// section: imports
import fs from "fs";
import path from "path";
import axios from "axios";
import { HazoConfig } from "hazo_config/dist/lib";
import { createLogger } from "hazo_logs";
import type {
  app_context,
  captcha_settings,
  logger_service,
  password_policy,
  rate_limit_settings,
  runtime_configuration,
  token_settings,
} from "../types/app_types";

// section: schema_definitions
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
const is_string_record = (value: unknown): value is Record<string, string> =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.values(value).every((entry) => typeof entry === "string");

const sanitize_configuration_options = (
  options: configuration_options | undefined,
  logger: logger_service
): configuration_options => {
  if (!options || typeof options !== "object") {
    return {};
  }

  const sanitized: configuration_options = {};

  if (typeof options.config_file_path === "string" && options.config_file_path.length > 0) {
    sanitized.config_file_path = options.config_file_path;
  }

  if (options.direct_configuration && typeof options.direct_configuration === "object") {
    const direct_config: direct_configuration_input = {};
    const provided = options.direct_configuration;

    if (Array.isArray(provided.permission_names)) {
      direct_config.permission_names = provided.permission_names.filter(
        (permission) => typeof permission === "string"
      );
    }

    if (is_string_record(provided.templates)) {
      direct_config.templates = provided.templates;
    }

    if (is_string_record(provided.labels)) {
      direct_config.labels = provided.labels;
    }

    if (is_string_record(provided.styles)) {
      direct_config.styles = provided.styles;
    }

    if (
      provided.emailer &&
      typeof provided.emailer === "object" &&
      typeof provided.emailer.base_url === "string"
    ) {
      direct_config.emailer = {
        base_url: provided.emailer.base_url,
        api_key:
          typeof provided.emailer.api_key === "string" ? provided.emailer.api_key : undefined,
        headers: is_string_record(provided.emailer.headers) ? provided.emailer.headers : undefined,
      };
    }

    if (provided.logger) {
      direct_config.logger = provided.logger;
    }

    if (provided.password_policy) {
      direct_config.password_policy = {
        min_length:
          typeof provided.password_policy.min_length === "number"
            ? provided.password_policy.min_length
            : undefined,
        requires_lowercase: provided.password_policy.requires_lowercase,
        requires_uppercase: provided.password_policy.requires_uppercase,
        requires_number: provided.password_policy.requires_number,
        requires_symbol: provided.password_policy.requires_symbol,
      };
    }

    if (provided.token_settings) {
      direct_config.token_settings = {
        access_token_ttl_seconds: provided.token_settings.access_token_ttl_seconds,
        refresh_token_ttl_seconds: provided.token_settings.refresh_token_ttl_seconds,
      };
    }

    if (provided.rate_limit) {
      direct_config.rate_limit = {
        max_attempts: provided.rate_limit.max_attempts,
        window_minutes: provided.rate_limit.window_minutes,
      };
    }

    if (provided.captcha) {
      direct_config.captcha = provided.captcha;
    }

    direct_config.logger?.info?.("config_direct_override_detected", { fields: Object.keys(direct_config) });
    sanitized.direct_configuration = direct_config;
  }

  return sanitized;
};

type resolved_emailer_options = {
  base_url: string;
  api_key?: string;
  headers?: Record<string, string>;
};

// section: defaults
const default_config_path = path.resolve(process.cwd(), "config.ini");

const default_password_policy: password_policy = {
  min_length: 12,
  requires_uppercase: true,
  requires_lowercase: true,
  requires_number: true,
  requires_symbol: true,
};

const default_token_settings: token_settings = {
  access_token_ttl_seconds: 15 * 60,
  refresh_token_ttl_seconds: 60 * 60 * 24 * 30,
};

const default_rate_limit: rate_limit_settings = {
  max_attempts: 5,
  window_minutes: 5,
};

const read_ini_section = (
  instance: HazoConfig | undefined,
  section: string
): Record<string, string> => {
  if (instance === undefined) {
    return {};
  }
  return instance.getSection(section) ?? {};
};

// section: helper_functions
const resolve_permissions = (
  direct_permissions: string[] | undefined,
  permission_section: Record<string, string>,
  logger: logger_service
): string[] => {
  if (direct_permissions && direct_permissions.length > 0) {
    logger.info("config_permissions_direct_override", { count: direct_permissions.length });
    return direct_permissions;
  }

  const configured = permission_section.list
    ?.split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  if (configured && configured.length > 0) {
    logger.info("config_permissions_from_file", { count: configured.length });
    return configured;
  }

  logger.warn("config_permissions_default", {});
  return [];
};

const resolve_password_policy = (
  direct_policy: Partial<password_policy> | undefined,
  auth_section: Record<string, string>,
  logger: logger_service
): password_policy => {
  const resolved: password_policy = { ...default_password_policy };

  const apply_value = <K extends keyof password_policy>(key: K, value: string | undefined) => {
    if (value === undefined) {
      return;
    }
    if (key === "min_length") {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        (resolved as any)[key] = parsed;
      }
      return;
    }
    (resolved as any)[key] = value === "true";
  };

  apply_value("min_length", auth_section.min_length);
  apply_value("requires_uppercase", auth_section.requires_uppercase);
  apply_value("requires_lowercase", auth_section.requires_lowercase);
  apply_value("requires_number", auth_section.requires_number);
  apply_value("requires_symbol", auth_section.requires_symbol);

  if (direct_policy) {
    Object.assign(resolved, direct_policy);
    logger.info("config_password_policy_direct_override", resolved);
  }

  return resolved;
};

const resolve_token_settings = (
  direct_tokens: Partial<token_settings> | undefined,
  auth_section: Record<string, string>,
  logger: logger_service
): token_settings => {
  const resolved: token_settings = { ...default_token_settings };

  const access_token_value = Number(auth_section.access_token_ttl_seconds);
  if (!Number.isNaN(access_token_value) && access_token_value > 0) {
    resolved.access_token_ttl_seconds = access_token_value;
  }

  const refresh_token_value = Number(auth_section.refresh_token_ttl_seconds);
  if (!Number.isNaN(refresh_token_value) && refresh_token_value > 0) {
    resolved.refresh_token_ttl_seconds = refresh_token_value;
  }

  if (direct_tokens) {
    Object.assign(resolved, direct_tokens);
    logger.info("config_token_settings_direct_override", resolved);
  }

  return resolved;
};

const resolve_rate_limit = (
  direct_rate_limit: Partial<rate_limit_settings> | undefined,
  rate_section: Record<string, string>,
  logger: logger_service
): rate_limit_settings => {
  const resolved: rate_limit_settings = { ...default_rate_limit };

  const max_attempts = Number(rate_section.max_attempts);
  if (!Number.isNaN(max_attempts) && max_attempts > 0) {
    resolved.max_attempts = max_attempts;
  }

  const window_minutes = Number(rate_section.window_minutes);
  if (!Number.isNaN(window_minutes) && window_minutes > 0) {
    resolved.window_minutes = window_minutes;
  }

  if (direct_rate_limit) {
    Object.assign(resolved, direct_rate_limit);
    logger.info("config_rate_limit_direct_override", resolved);
  }

  return resolved;
};

const resolve_captcha = (
  direct_captcha: captcha_settings | undefined,
  captcha_section: Record<string, string>,
  logger: logger_service
): captcha_settings => {
  if (direct_captcha) {
    logger.info("config_captcha_direct_override", { provider: direct_captcha.provider });
    return direct_captcha;
  }

  if (captcha_section.provider && captcha_section.secret_key) {
    logger.info("config_captcha_from_file", { provider: captcha_section.provider });
    return {
      provider: captcha_section.provider as "recaptcha_v2" | "recaptcha_v3" | "hcaptcha",
      secret_key: captcha_section.secret_key,
    };
  }

  logger.warn("config_captcha_missing", {});
  return undefined;
};

const resolve_dictionary = (
  direct_values: Record<string, string> | undefined,
  section_values: Record<string, string>,
  logger: logger_service,
  metric_name: string
): Record<string, string> => {
  if (direct_values && Object.keys(direct_values).length > 0) {
    logger.info(`${metric_name}_direct_override`, { keys: Object.keys(direct_values) });
    return direct_values;
  }

  if (Object.keys(section_values).length > 0) {
    logger.info(`${metric_name}_from_file`, { keys: Object.keys(section_values) });
    return section_values;
  }

  logger.warn(`${metric_name}_empty`, {});
  return {};
};

const read_template_file = (file_path: string, logger: logger_service): string | undefined => {
  const absolute_path = path.isAbsolute(file_path)
    ? file_path
    : path.resolve(process.cwd(), file_path);

  try {
    const content = fs.readFileSync(absolute_path, "utf-8");
    logger.info("config_template_loaded", { file_path: absolute_path });
    return content;
  } catch (error) {
    logger.error("config_template_load_failed", {
      file_path: absolute_path,
      error: (error as Error).message,
    });
    return undefined;
  }
};

const resolve_templates = (
  direct_templates: Record<string, string> | undefined,
  template_section: Record<string, string>,
  logger: logger_service
): Record<string, string> => {
  const resolved_templates: Record<string, string> = {};

  Object.entries(template_section).forEach(([template_name, template_path]) => {
    const template_content = read_template_file(template_path, logger);
    if (template_content) {
      resolved_templates[template_name] = template_content;
    }
  });

  if (direct_templates) {
    Object.entries(direct_templates).forEach(([template_name, template_body]) => {
      resolved_templates[template_name] = template_body;
    });
    logger.info("config_templates_direct_override", { count: Object.keys(direct_templates).length });
  }

  return resolved_templates;
};

const create_emailer_client = (
  emailer_options: resolved_emailer_options | undefined,
  logger: logger_service
) => {
  if (!emailer_options) {
    return {
      send_message: async () => {
        logger.warn("emailer_placeholder_invoked", {});
        return { success: true };
      },
    };
  }

  const client = axios.create({
    baseURL: emailer_options.base_url,
    headers: {
      ...(emailer_options.headers ?? {}),
      ...(emailer_options.api_key ? { Authorization: `Bearer ${emailer_options.api_key}` } : {}),
      "Content-Type": "application/json",
    },
  });

  return {
    send_message: async (payload: Record<string, unknown>) => {
      try {
        logger.info("emailer_request_initiated", { payload });
        await client.post("/send", payload);
        logger.info("emailer_request_success", {});
        return { success: true };
      } catch (error) {
        logger.error("emailer_request_failed", { error: (error as Error).message });
        return { success: false };
      }
    },
  };
};

// section: loader
export const load_runtime_configuration = (
  options?: configuration_options
): runtime_configuration => {
  const fallback_logger = createLogger("hazo_auth_config");
  const parsed_options = sanitize_configuration_options(options, fallback_logger);
  const direct_configuration = parsed_options.direct_configuration;
  const logger = direct_configuration?.logger ?? fallback_logger;

  let hazo_config: HazoConfig | undefined;

  try {
    const config_file_path = parsed_options?.config_file_path ?? default_config_path;
    if (fs.existsSync(config_file_path)) {
      hazo_config = new HazoConfig({
        filePath: config_file_path,
        logger,
      });
      logger.info("config_file_loaded", { config_file_path });
    } else {
      logger.warn("config_file_missing", { config_file_path });
    }
  } catch (error) {
    logger.error("config_file_error", { error: (error as Error).message });
  }

  const permission_section = read_ini_section(hazo_config, "permissions");
  const auth_section = read_ini_section(hazo_config, "auth");
  const rate_section = read_ini_section(hazo_config, "rate_limit");
  const label_section = read_ini_section(hazo_config, "labels");
  const style_section = read_ini_section(hazo_config, "styles");
  const template_section = read_ini_section(hazo_config, "templates");
  const emailer_section = read_ini_section(hazo_config, "emailer");
  const captcha_section = read_ini_section(hazo_config, "captcha");

  const permission_names = resolve_permissions(
    direct_configuration?.permission_names,
    permission_section,
    logger
  );

  const password_policy = resolve_password_policy(
    direct_configuration?.password_policy,
    auth_section,
    logger
  );

  const token_settings = resolve_token_settings(
    direct_configuration?.token_settings,
    auth_section,
    logger
  );

  const rate_limit = resolve_rate_limit(
    direct_configuration?.rate_limit,
    rate_section,
    logger
  );

  const labels = resolve_dictionary(direct_configuration?.labels, label_section, logger, "config_labels");
  const styles = resolve_dictionary(direct_configuration?.styles, style_section, logger, "config_styles");
  const templates = resolve_templates(direct_configuration?.templates, template_section, logger);

  const resolved_emailer_options =
    direct_configuration?.emailer ??
    (emailer_section.base_url
      ? {
          base_url: emailer_section.base_url,
          api_key: emailer_section.api_key,
          headers: emailer_section.headers ? JSON.parse(emailer_section.headers) : undefined,
        }
      : undefined);

  const emailer = create_emailer_client(resolved_emailer_options, logger);

  const captcha = resolve_captcha(direct_configuration?.captcha, captcha_section, logger);

  return {
    permission_names,
    logger,
    emailer,
    templates,
    labels,
    styles,
    password_policy,
    token_settings,
    rate_limit,
    captcha,
  };
};

// section: context_factory
export const create_app_context = (options?: configuration_options): app_context => ({
  config: load_runtime_configuration(options),
});

