/**
 * Sync schema defaults to Supabase, preserving human edits.
 *
 * USAGE
 *   pnpm sync-defaults              # dry run, lists what would change
 *   pnpm sync-defaults -- --apply   # actually update
 *   pnpm sync-defaults -- --apply --pattern "AR 内查"
 *                                   # only touch rows whose current value contains
 *                                   # the given marker (heuristic for one-off cleanups)
 *
 * HOW IT DECIDES "untouched vs edited"
 *
 * Default mode (no --pattern):
 *   - Compare row.value against the field's current schema defaultValue.
 *   - Already-equal rows are no-ops.
 *   - Different rows are treated as "edited" and SKIPPED.
 *   - This means in default mode the script is essentially a back-fill — only
 *     fields with no row at all get inserted with the current default.
 *
 * Pattern mode (--pattern "STRING"):
 *   - Any row whose value (text fields) contains STRING is considered "stale
 *     bot-default" and replaced with the current schema default.
 *   - Useful for one-off corrections like stripping `[⚠ AR 内查]` markers when
 *     they were committed as defaults, then synced to Supabase, before a later
 *     schema cleanup. A human would never type that marker back in, so the
 *     match is reliable.
 *
 * RUN
 *   Reads VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY from .env.local.
 *   Signs in to Supabase anonymously (Allow anonymous sign-ins must be enabled).
 *   Anonymous sessions have RLS write access via the `any_auth_write` policy.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SECTIONS, type Field, type Section } from "../src/data/questionnaire";
import { GARTNER_CONTAINER_SECTIONS } from "../src/data/gartner-container";

// Lightweight .env.local loader (avoids adding dotenv as a dep).
function loadEnv(path: string): void {
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv(resolve(import.meta.dirname, "..", ".env.local"));

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const force = args.includes("--force");
const patternIdx = args.indexOf("--pattern");
const pattern = patternIdx !== -1 ? args[patternIdx + 1] : undefined;
// Restrict the whole run to field_ids starting with this prefix (e.g. "gc_" for the
// Gartner questionnaire only). Rows outside the prefix are left completely untouched.
const prefixIdx = args.indexOf("--prefix");
const prefix = prefixIdx !== -1 ? args[prefixIdx + 1] : undefined;
// Only update rows that already exist; never insert new rows. Keeps answers that
// have no DB row code-driven (rendering from defaultValue) so later schema tweaks
// show immediately without re-syncing.
const updateOnly = args.includes("--update-only");

const URL = process.env.VITE_SUPABASE_URL;
const KEY = process.env.VITE_SUPABASE_ANON_KEY;
if (!URL || !KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Build field_id → default value (string for text, string[] for checks)
function collectFields(sections: Section[]): Field[] {
  const out: Field[] = [];
  sections.forEach((s) =>
    s.questions.forEach((q) =>
      q.groups.forEach((g) => g.fields.forEach((f) => out.push(f))),
    ),
  );
  return out;
}

const defaultsByField = new Map<string, string | string[]>();
for (const f of collectFields([...SECTIONS, ...GARTNER_CONTAINER_SECTIONS])) {
  defaultsByField.set(f.id, f.defaultValue);
  if (f.kind === "text") {
    // EN side lives at <id>__en. Empty = not yet translated.
    defaultsByField.set(`${f.id}__en`, f.defaultValueEn ?? "");
  }
}

const mode = force ? "force" : pattern ? `pattern("${pattern}")` : "exact-match";
console.log(`Mode: ${mode}${prefix ? ` · prefix="${prefix}"` : ""} · ${apply ? "APPLY" : "DRY RUN"}`);
if (force && pattern) {
  console.warn("Warning: --force overrides --pattern; pattern ignored.");
}
console.log(`Schema fields: ${defaultsByField.size}`);

const { data: signIn, error: signInErr } = await supabase.auth.signInAnonymously({
  options: { data: { display_name: "sync-defaults-script" } },
});
if (signInErr) {
  console.error("Anonymous sign-in failed:", signInErr.message);
  process.exit(1);
}
console.log(`Signed in as anon user ${signIn.user?.id}`);

const { data: rows, error: readErr } = await supabase
  .from("answers")
  .select("field_id, value");
if (readErr) {
  console.error("Read failed:", readErr.message);
  process.exit(1);
}
console.log(`Existing rows: ${rows?.length ?? 0}`);

let toUpdate = 0;
let toInsert = 0;
let preserved = 0;
let alreadyClean = 0;
let unknown = 0;

const updates: Array<{ field_id: string; oldPreview: string; newPreview: string }> = [];
const inserts: Array<{ field_id: string; preview: string }> = [];

const seenFieldIds = new Set<string>();

for (const row of rows ?? []) {
  seenFieldIds.add(row.field_id);
  if (prefix && !row.field_id.startsWith(prefix)) {
    preserved++;
    continue;
  }
  const newDefault = defaultsByField.get(row.field_id);
  if (!newDefault) {
    unknown++;
    continue;
  }
  const valueStr =
    typeof row.value === "string" ? row.value : JSON.stringify(row.value);
  const newDefaultStr =
    typeof newDefault === "string" ? newDefault : JSON.stringify(newDefault);

  if (valueStr === newDefaultStr) {
    alreadyClean++;
    continue;
  }

  let shouldReplace: boolean;
  if (force) {
    shouldReplace = true;
  } else if (pattern) {
    shouldReplace = valueStr.includes(pattern);
  } else {
    // Default (exact-match) mode: anything that isn't already at the new default
    // is treated as a human edit — skip it.
    shouldReplace = false;
  }

  if (shouldReplace) {
    toUpdate++;
    updates.push({
      field_id: row.field_id,
      oldPreview: valueStr.slice(0, 80) + (valueStr.length > 80 ? "..." : ""),
      newPreview:
        newDefaultStr.slice(0, 80) + (newDefaultStr.length > 80 ? "..." : ""),
    });
  } else {
    preserved++;
  }
}

// In force mode, also INSERT rows for schema fields that don't exist in Supabase yet.
// Only do this in force mode — exact-match / pattern modes are intentionally
// "do not touch unedited fields" and adding new rows would surprise users.
if (force && !updateOnly) {
  for (const [field_id, defaultValue] of defaultsByField.entries()) {
    if (seenFieldIds.has(field_id)) continue;
    if (prefix && !field_id.startsWith(prefix)) continue;
    const valueStr =
      typeof defaultValue === "string"
        ? defaultValue
        : JSON.stringify(defaultValue);
    if (typeof defaultValue === "string" && defaultValue.trim() === "") {
      // Skip empty EN slots — let UI fall back to schema default.
      continue;
    }
    toInsert++;
    inserts.push({
      field_id,
      preview: valueStr.slice(0, 80) + (valueStr.length > 80 ? "..." : ""),
    });
  }
}

console.log("");
console.log("=== Plan ===");
console.log(`  to update : ${toUpdate}`);
console.log(`  to insert : ${toInsert}  (force mode only — new rows for schema fields not yet in DB)`);
console.log(`  preserved : ${preserved}  (human edits or non-matching pattern)`);
console.log(`  already clean : ${alreadyClean}`);
console.log(`  unknown field id (in DB but not in schema) : ${unknown}`);

if (updates.length > 0) {
  console.log("");
  console.log("=== Updates ===");
  for (const u of updates) {
    console.log(`[${u.field_id}]`);
    console.log(`  -- ${u.oldPreview}`);
    console.log(`  ++ ${u.newPreview}`);
  }
}

if (inserts.length > 0) {
  console.log("");
  console.log("=== Inserts ===");
  for (const i of inserts) {
    console.log(`[${i.field_id}] (new) ${i.preview}`);
  }
}

if (!apply) {
  console.log("");
  console.log("Dry run only. Re-run with --apply to push these updates.");
  process.exit(0);
}

if (toUpdate === 0 && toInsert === 0) {
  console.log("Nothing to update or insert.");
  process.exit(0);
}

console.log("");
console.log("=== Applying ===");
let applied = 0;
let failed = 0;
for (const u of updates) {
  const newDefault = defaultsByField.get(u.field_id)!;
  const { error } = await supabase
    .from("answers")
    .update({ value: newDefault })
    .eq("field_id", u.field_id);
  if (error) {
    failed++;
    console.error(`  [${u.field_id}] FAILED: ${error.message}`);
  } else {
    applied++;
    console.log(`  [${u.field_id}] OK`);
  }
}

let inserted = 0;
for (const ins of inserts) {
  const newDefault = defaultsByField.get(ins.field_id)!;
  const { error } = await supabase
    .from("answers")
    .insert({ field_id: ins.field_id, value: newDefault });
  if (error) {
    failed++;
    console.error(`  [${ins.field_id}] INSERT FAILED: ${error.message}`);
  } else {
    inserted++;
    console.log(`  [${ins.field_id}] inserted`);
  }
}

console.log("");
console.log(
  `Applied ${applied} updates / ${toUpdate}, ${inserted} inserts / ${toInsert}, ${failed} failed.`,
);

await supabase.auth.signOut();
