/**
 * Import a skill-generated platform-export.json into Supabase.
 *
 * Pairs with analyst-questionnaire-runner Phase 4.5 — schema is defined in
 * the skill repo: skills/analyst-questionnaire-runner/references/platform-export-contract.md
 *
 * USAGE
 *   pnpm tsx scripts/import-skill-output.ts --file <path>            # dry run (default)
 *   pnpm tsx scripts/import-skill-output.ts --file <path> --apply    # write to Supabase
 *
 * Reads VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY from .env.local and signs in
 * anonymously (same as sync-defaults.ts). Requires schema.sql + platform-layer.sql.
 *
 * CONFLICT POLICY (per field, by current answer_meta.state)
 *   NOT STARTED / AI DRAFTED      -> overwrite content + set state from export
 *   PRODUCT REVIEW / KEVIN REVIEW -> park the AI version as a suggestion; keep human content
 *   READY                         -> keep content; flag needs_attention if export carries lint/conflicts
 *   SUBMITTED                     -> skip content (locked); audit only
 *   evidence / reviewer_hooks / lint / conflicts / type_tag / word_limit -> ALWAYS merged
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// ---- types (mirror platform-export-contract.md) ----
type State =
  | "NOT STARTED"
  | "AI DRAFTED"
  | "PRODUCT REVIEW"
  | "KEVIN REVIEW"
  | "READY"
  | "SUBMITTED"
  | "BLOCKED";

interface FieldExport {
  field_id: string;
  content_zh?: string;
  content_en?: string;
  evidence?: unknown[];
  reviewer_hooks?: { reviewer?: string; kind?: string; text?: string; reason?: string }[];
  lint?: unknown[];
  conflicts?: unknown[];
}
interface QuestionExport {
  question_id: string;
  type_tag?: unknown;
  word_limit?: number;
  status?: State;
  fields: FieldExport[];
}
interface Bundle {
  export_version: string;
  questionnaire_id: string;
  firm?: string;
  generated_at?: string;
  questions: QuestionExport[];
}

const enKeyOf = (id: string): string => `${id}__en`;

// ---- env loader (avoids a dotenv dep; same as sync-defaults.ts) ----
function loadEnv(path: string): void {
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv(resolve(import.meta.dirname, "..", ".env.local"));

// ---- args ----
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const fileIdx = args.indexOf("--file");
const file = fileIdx !== -1 ? args[fileIdx + 1] : undefined;
if (!file) {
  console.error("Missing --file <path to platform-export.json>");
  process.exit(1);
}

const URL = process.env.VITE_SUPABASE_URL;
const KEY = process.env.VITE_SUPABASE_ANON_KEY;
if (!URL || !KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

// ---- load bundle ----
let bundle: Bundle;
try {
  bundle = JSON.parse(readFileSync(resolve(file), "utf8")) as Bundle;
} catch (e) {
  console.error(`Failed to read/parse ${file}: ${(e as Error).message}`);
  process.exit(1);
}
const flatFields: { q: QuestionExport; f: FieldExport }[] = [];
for (const q of bundle.questions ?? []) {
  for (const f of q.fields ?? []) flatFields.push({ q, f });
}
console.log(
  `Bundle: ${bundle.questionnaire_id} (${bundle.firm ?? "?"}) · v${bundle.export_version} · ` +
    `${bundle.questions?.length ?? 0} questions · ${flatFields.length} fields · ${apply ? "APPLY" : "DRY RUN"}`,
);

const supabase = createClient(URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error: signInErr } = await supabase.auth.signInAnonymously({
  options: { data: { display_name: "import-skill-output" } },
});
if (signInErr) {
  console.error("Anonymous sign-in failed:", signInErr.message);
  process.exit(1);
}

// ---- current state per field (for the conflict policy) ----
const { data: metaRows, error: metaErr } = await supabase
  .from("answer_meta")
  .select("field_id, state");
if (metaErr) {
  console.error("Read answer_meta failed (did you run platform-layer.sql?):", metaErr.message);
  process.exit(1);
}
const stateByField = new Map<string, State>();
for (const r of metaRows ?? []) stateByField.set(r.field_id, r.state as State);

const HUMAN_EDITING: State[] = ["PRODUCT REVIEW", "KEVIN REVIEW"];

type Action = "overwrite" | "suggest" | "flag" | "skip";
function decide(current: State | undefined): Action {
  if (current === undefined || current === "NOT STARTED" || current === "AI DRAFTED") return "overwrite";
  if (HUMAN_EDITING.includes(current)) return "suggest";
  if (current === "READY" || current === "BLOCKED") return "flag";
  if (current === "SUBMITTED") return "skip";
  return "overwrite";
}

// derive a default assignee_role from reviewer_hooks
function roleFromHooks(f: FieldExport): string | null {
  const hooks = f.reviewer_hooks ?? [];
  if (hooks.some((h) => h.reviewer === "product")) return "product";
  if (hooks.some((h) => h.reviewer === "Kevin")) return "kevin";
  return null;
}

// ---- plan ----
let overwritten = 0,
  suggested = 0,
  flagged = 0,
  skipped = 0;
const planLines: string[] = [];
for (const { f } of flatFields) {
  const action = decide(stateByField.get(f.field_id));
  if (action === "overwrite") overwritten++;
  else if (action === "suggest") suggested++;
  else if (action === "flag") flagged++;
  else skipped++;
  planLines.push(`  [${f.field_id}] ${stateByField.get(f.field_id) ?? "NOT STARTED"} -> ${action}`);
}
console.log("\n=== Plan ===");
console.log(`  overwrite : ${overwritten}`);
console.log(`  suggest   : ${suggested}  (human already editing — parked as suggestion)`);
console.log(`  flag      : ${flagged}    (READY/BLOCKED — content kept, metadata updated)`);
console.log(`  skip      : ${skipped}    (SUBMITTED — locked)`);
console.log("\n" + planLines.join("\n"));

if (!apply) {
  console.log("\nDry run only. Re-run with --apply to write.");
  await supabase.auth.signOut();
  process.exit(0);
}

// ---- apply ----
console.log("\n=== Applying ===");
let failed = 0;

async function upsertContent(field_id: string, zh?: string, en?: string): Promise<void> {
  if (typeof zh === "string") {
    const { error } = await supabase.from("answers").upsert({ field_id, value: zh }, { onConflict: "field_id" });
    if (error) {
      failed++;
      console.error(`  [${field_id}] content_zh FAILED: ${error.message}`);
    }
  }
  if (typeof en === "string" && en.length > 0) {
    const { error } = await supabase
      .from("answers")
      .upsert({ field_id: enKeyOf(field_id), value: en }, { onConflict: "field_id" });
    if (error) {
      failed++;
      console.error(`  [${field_id}] content_en FAILED: ${error.message}`);
    }
  }
}

for (const { q, f } of flatFields) {
  const action = decide(stateByField.get(f.field_id));

  // metadata is ALWAYS merged
  const metaBase = {
    field_id: f.field_id,
    questionnaire_id: bundle.questionnaire_id,
    type_tag: q.type_tag ?? null,
    word_limit: q.word_limit ?? null,
    evidence: f.evidence ?? [],
    reviewer_hooks: f.reviewer_hooks ?? [],
    lint: f.lint ?? [],
    conflicts: f.conflicts ?? [],
    assignee_role: roleFromHooks(f),
    ai_origin: true,
  };

  if (action === "overwrite") {
    await upsertContent(f.field_id, f.content_zh, f.content_en);
    const { error } = await supabase
      .from("answer_meta")
      .upsert({ ...metaBase, state: q.status ?? "AI DRAFTED" }, { onConflict: "field_id" });
    if (error) {
      failed++;
      console.error(`  [${f.field_id}] meta FAILED: ${error.message}`);
    }
  } else if (action === "suggest") {
    // park the AI version; do not touch content or state
    const { data: cur } = await supabase
      .from("answer_meta")
      .select("suggestions")
      .eq("field_id", f.field_id)
      .single();
    const suggestions = Array.isArray(cur?.suggestions) ? cur!.suggestions : [];
    suggestions.push({
      at: new Date().toISOString(),
      source: `import v${bundle.export_version}`,
      content_zh: f.content_zh ?? "",
      content_en: f.content_en ?? "",
    });
    const { error } = await supabase
      .from("answer_meta")
      .upsert({ ...metaBase, suggestions, needs_attention: true }, { onConflict: "field_id" });
    if (error) {
      failed++;
      console.error(`  [${f.field_id}] suggest FAILED: ${error.message}`);
    }
  } else if (action === "flag") {
    const hasSignals = (f.lint?.length ?? 0) > 0 || (f.conflicts?.length ?? 0) > 0;
    const { error } = await supabase
      .from("answer_meta")
      .upsert({ ...metaBase, needs_attention: hasSignals }, { onConflict: "field_id" });
    if (error) {
      failed++;
      console.error(`  [${f.field_id}] flag FAILED: ${error.message}`);
    }
  } else {
    // skip (SUBMITTED): content locked; still merge metadata for audit
    const { error } = await supabase
      .from("answer_meta")
      .upsert({ ...metaBase }, { onConflict: "field_id" });
    if (error) {
      failed++;
      console.error(`  [${f.field_id}] skip-meta FAILED: ${error.message}`);
    }
  }
}

const { error: logErr } = await supabase.from("import_log").insert({
  questionnaire_id: bundle.questionnaire_id,
  export_version: bundle.export_version,
  generated_at: bundle.generated_at ?? null,
  overwritten,
  suggested,
  skipped,
  merged: flatFields.length,
});
if (logErr) console.warn("import_log insert failed:", logErr.message);

console.log(
  `\nDone. overwrite ${overwritten}, suggest ${suggested}, flag ${flagged}, skip ${skipped}, failed ${failed}.`,
);
await supabase.auth.signOut();
