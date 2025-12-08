// file_description: Next.js instrumentation entry point
// This file is loaded for both Node.js and Edge runtimes
// Node.js-specific initialization is in instrumentation-node.ts
// section: instrumentation

export async function register() {
  // Use NEXT_RUNTIME environment variable to detect runtime
  // This is the recommended approach from Next.js documentation
  // https://nextjs.org/docs/app/guides/instrumentation
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node");
  }
  // Edge runtime: no initialization needed
  // if (process.env.NEXT_RUNTIME === 'edge') {
  //   await import('./instrumentation-edge')
  // }
}
