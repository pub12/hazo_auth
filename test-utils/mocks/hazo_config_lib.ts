// file_description: jest mock for the hazo_config library to simplify testing
type section_map = Record<string, Record<string, string>>;

export class HazoConfig {
  private readonly sections: section_map;

  constructor(options: { filePath: string }) {
    // Load ini file lazily during tests using Node fs to keep behavior consistent.
    const fs = require("fs") as typeof import("fs");
    const ini = require("ini") as typeof import("ini");
    if (!fs.existsSync(options.filePath)) {
      throw new Error(`Configuration file not found: ${options.filePath}`);
    }
    const raw_content = fs.readFileSync(options.filePath, "utf-8");
    const parsed = ini.parse(raw_content) as Record<string, Record<string, string>>;
    this.sections = {};
    Object.entries(parsed).forEach(([section, values]) => {
      this.sections[section] = { ...values };
    });
  }

  get(section: string, key: string): string | undefined {
    return this.sections[section]?.[key];
  }

  getSection(section: string): Record<string, string> | undefined {
    const values = this.sections[section];
    return values ? { ...values } : undefined;
  }
}


