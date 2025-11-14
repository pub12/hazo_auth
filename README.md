## hazo_auth - Authentication UI Component Package

A reusable authentication UI component package powered by Next.js, TailwindCSS, and shadcn. It integrates `hazo_config` for configuration management and `hazo_connect` for data access, enabling future components to stay aligned with platform conventions.

### Installation

```bash
npm install hazo_auth
```

### Configuration Setup

After installing the package, you need to set up configuration files in your project root:

1. **Copy the example config files to your project root:**
   ```bash
   cp node_modules/hazo_auth/hazo_auth_config.example.ini ./hazo_auth_config.ini
   cp node_modules/hazo_auth/hazo_notify_config.example.ini ./hazo_notify_config.ini
   ```

2. **Customize the configuration files:**
   - Edit `hazo_auth_config.ini` to configure authentication settings, database connection, UI labels, and more
   - Edit `hazo_notify_config.ini` to configure email service settings (Zeptomail, SMTP, etc.)

3. **Set up environment variables (recommended for sensitive data):**
   - Create a `.env.local` file in your project root
   - Add `ZEPTOMAIL_API_KEY=your_api_key_here` (if using Zeptomail)
   - Add other sensitive configuration values as needed

**Important:** The configuration files must be located in your project root directory (where `process.cwd()` points to), not inside `node_modules`. The package reads configuration from `process.cwd()` at runtime.

### Local Development (for package contributors)

- `npm install` to install dependencies.
- `npm run dev` launches the Next.js app at `http://localhost:3000`.
- `npm run storybook` launches Storybook at `http://localhost:6006`.

### Project Structure

- `src/app` contains the application shell and route composition.
- `src/stories` holds Storybook stories for documenting components.
- `src/lib` is the home for shared utilities.

### Next Steps

- Use `npx shadcn@latest add <component>` to scaffold new UI primitives.
- Centralize configurable values through `hazo_config`.
- Access backend resources exclusively via `hazo_connect`.
