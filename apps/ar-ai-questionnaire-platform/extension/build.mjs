/**
 * Minimal, self-contained build: bundle the TS entrypoints to dist/ and copy
 * the manifest + icons. Produces a directory (dist/) that loads unpacked.
 *
 * Usage:
 *   node build.mjs            # one-shot build
 *   node build.mjs --watch    # rebuild on change
 */
import esbuild from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = resolve(__dirname, "dist");
const watch = process.argv.includes("--watch");

async function copyAssets() {
  await cp(resolve(__dirname, "manifest.json"), resolve(dist, "manifest.json"));
  await cp(resolve(__dirname, "icons"), resolve(dist, "icons"), { recursive: true });
}

const common = {
  bundle: true,
  format: "esm",
  target: "chrome110",
  platform: "browser",
  logLevel: "info",
  legalComments: "none",
};

async function run() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  const entries = [
    { in: resolve(__dirname, "src/content.ts"), out: "content" },
    { in: resolve(__dirname, "src/background.ts"), out: "background" },
  ];

  const opts = {
    ...common,
    entryPoints: entries.map((e) => ({ in: e.in, out: e.out })),
    outdir: dist,
    minify: !watch,
    sourcemap: watch,
  };

  if (watch) {
    const ctx = await esbuild.context(opts);
    await copyAssets();
    await ctx.watch();
    console.log("watching… (dist/ ready to load unpacked)");
  } else {
    await esbuild.build(opts);
    await copyAssets();
    console.log("build complete → dist/");
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
