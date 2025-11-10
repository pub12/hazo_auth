// file_description: render the default landing page for the ui_component project
// section: imports
import Link from "next/link";

// section: page_component
export default function home_page() {
  return (
    <div className="cls_home_wrapper flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-b from-slate-50 to-white p-8 text-slate-900">
      <main className="cls_home_content flex w-full max-w-3xl flex-col items-center justify-center gap-6 text-center">
        <h1 className="cls_home_title text-3xl font-semibold tracking-tight md:text-4xl">
          hazo reusable ui library workspace
        </h1>
        <p className="cls_home_summary text-base leading-relaxed text-slate-600 md:text-lg">
          Start shaping accessible, shadcn-powered components with integrated
          hazo_config and hazo_connect support. Storybook is pre-installed so
          you can document and iterate on each piece with confidence.
        </p>
        <div className="cls_home_links flex flex-col items-center justify-center gap-4 md:flex-row">
          <Link
            className="cls_home_storybook_link rounded-md bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
            href="http://localhost:6006"
            aria-label="Open Storybook preview for reusable components"
          >
            open storybook preview
          </Link>
          <Link
            className="cls_home_docs_link rounded-md border border-slate-200 px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-slate-100"
            href="https://ui.shadcn.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Review shadcn documentation for styling guidance"
          >
            review shadcn documentation
          </Link>
        </div>
      </main>
    </div>
  );
}
