## ui_component workspace overview

This repository hosts a reusable UI component playground powered by Next.js, TailwindCSS, and shadcn. It integrates `hazo_config` for configuration management and `hazo_connect` for data access, enabling future components to stay aligned with platform conventions.

### local development
- `npm install` to install dependencies.
- `npm run dev` launches the Next.js app at `http://localhost:3000`.
- `npm run storybook` launches Storybook at `http://localhost:6006`.

### project structure
- `src/app` contains the application shell and route composition.
- `src/stories` holds Storybook stories for documenting components.
- `src/lib` is the home for shared utilities.

### next steps
- Use `npx shadcn@latest add <component>` to scaffold new UI primitives.
- Centralize configurable values through `hazo_config`.
- Access backend resources exclusively via `hazo_connect`.
