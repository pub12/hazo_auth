// file_description: unit tests covering configuration precedence rules for hazo_auth
import fs from "fs";
import os from "os";
import path from "path";
import { load_runtime_configuration } from "@/server/config/config_loader";
import type { configuration_options } from "@/server/config/config_loader";

const create_temp_config = (content: string): string => {
  const temp_dir = fs.mkdtempSync(path.join(os.tmpdir(), "hazo-config-"));
  const config_path = path.join(temp_dir, "config.ini");
  fs.writeFileSync(config_path, content, "utf-8");
  return config_path;
};

describe("config_loader precedence behavior", () => {
  it("loads configuration from ini file when no direct overrides are provided", () => {
    const config_path = create_temp_config(`
[permissions]
list = PERM_ONE, PERM_TWO

[auth]
min_length = 14
requires_uppercase = true
requires_lowercase = true
requires_number = true
requires_symbol = true
access_token_ttl_seconds = 1200
refresh_token_ttl_seconds = 172800

[rate_limit]
max_attempts = 7
window_minutes = 10

[labels]
login_title = welcome back

[styles]
primary_color = "#336699"

[templates]
login = ${path.join(__dirname, "fixtures", "login_template.hbs")}

[emailer]
base_url = https://mailer.example.com
api_key = test-key

[captcha]
provider = recaptcha_v3
secret_key = recaptcha-secret
`);

    const configuration = load_runtime_configuration({
      config_file_path: config_path,
    });

    expect(configuration.permission_names).toEqual(["PERM_ONE", "PERM_TWO"]);
    expect(configuration.password_policy.min_length).toBe(14);
    expect(configuration.token_settings.access_token_ttl_seconds).toBe(1200);
    expect(configuration.token_settings.refresh_token_ttl_seconds).toBe(172800);
    expect(configuration.rate_limit.max_attempts).toBe(7);
    expect(configuration.rate_limit.window_minutes).toBe(10);
    expect(configuration.labels.login_title).toBe("welcome back");
    expect(configuration.styles.primary_color).toBe("#336699");
    expect(configuration.templates.login).toContain("{{title}}");
    expect(configuration.captcha?.provider).toBe("recaptcha_v3");
    expect(configuration.captcha?.secret_key).toBe("recaptcha-secret");
  });

  it("prefers direct overrides when provided", () => {
    const config_path = create_temp_config(`
[permissions]
list = PERM_FILE_ONE

[auth]
min_length = 8

[templates]
login = ${path.join(__dirname, "fixtures", "login_template.hbs")}
`);

    const options: configuration_options = {
      config_file_path: config_path,
      direct_configuration: {
        permission_names: ["PERM_DIRECT_ONE", "PERM_DIRECT_TWO"],
        labels: { login_title: "direct label" },
        styles: { primary_color: "#111111" },
        password_policy: {
          min_length: 20,
        },
        templates: {
          login: "<div>{{direct_login}}</div>",
        },
      },
    };

    const configuration = load_runtime_configuration(options);

    expect(configuration.permission_names).toEqual([
      "PERM_DIRECT_ONE",
      "PERM_DIRECT_TWO",
    ]);
    expect(configuration.password_policy.min_length).toBe(20);
    expect(configuration.labels.login_title).toBe("direct label");
    expect(configuration.styles.primary_color).toBe("#111111");
    expect(configuration.templates.login).toContain("direct_login");
  });
});

