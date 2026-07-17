/**
 * Unit test for the pure URL-id extraction + index lookup logic.
 *
 * Runs in plain node. It bundles src/urlId.ts on the fly with esbuild (already a
 * devDependency) into memory, then imports it via a data: URL — so there is no
 * separate compile step and nothing to keep in sync.
 *
 *   npm test   (or: node test/urlId.test.mjs)
 */
import assert from "node:assert/strict";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));

const { outputFiles } = await esbuild.build({
  entryPoints: [resolve(__dirname, "../src/urlId.ts")],
  bundle: true,
  format: "esm",
  platform: "neutral",
  write: false,
  logLevel: "silent",
});
const code = outputFiles[0].text;
const mod = await import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));
const { extractUrlId, lookupUrlId } = mod;

let pass = 0;
function check(name, fn) {
  fn();
  pass++;
  console.log("  ok  " + name);
}

// ---- the real sample from the task ----
const SAMPLE = "DQUtpbGZPRG1kZ1dn";

console.log("extractUrlId:");
check("aio path → sample id", () =>
  assert.equal(extractUrlId("/aio/" + SAMPLE), SAMPLE),
);
check("doc path", () => assert.equal(extractUrlId("/doc/" + SAMPLE), SAMPLE));
check("doc/p path", () => assert.equal(extractUrlId("/doc/p/" + SAMPLE), SAMPLE));
check("sheet path", () => assert.equal(extractUrlId("/sheet/" + SAMPLE), SAMPLE));
check("trailing slash", () => assert.equal(extractUrlId("/aio/" + SAMPLE + "/"), SAMPLE));
check("trailing query (defensive)", () =>
  assert.equal(extractUrlId("/aio/" + SAMPLE + "?tab=1"), SAMPLE),
);
check("trailing hash (defensive)", () =>
  assert.equal(extractUrlId("/aio/" + SAMPLE + "#x"), SAMPLE),
);
check("query+hash combined", () =>
  assert.equal(extractUrlId("/doc/p/" + SAMPLE + "?a=b#frag"), SAMPLE),
);

check("home → null", () => assert.equal(extractUrlId("/"), null));
check("empty → null", () => assert.equal(extractUrlId(""), null));
check("desktop route → null", () => assert.equal(extractUrlId("/desktop"), null));
check("pages route → null", () => assert.equal(extractUrlId("/pages/recent"), null));
check("short fragment → null", () => assert.equal(extractUrlId("/aio/ab"), null));

console.log("\nlookupUrlId:");
const mockIndex = {
  [SAMPLE]: { questionId: "1.1", docId: "AKilfODmdgWg", questionnaireId: "ai-infra-2026" },
  DQU9tQWRYd2FHY1hE: { questionId: "1.2", docId: "AOmAdXwaGcXD", questionnaireId: "ai-infra-2026" },
};

check("sample id resolves to question 1.1", () => {
  const hit = lookupUrlId(mockIndex, SAMPLE);
  assert.ok(hit);
  assert.equal(hit.questionId, "1.1");
  assert.equal(hit.questionnaireId, "ai-infra-2026");
});
check("end-to-end: pathname → id → pointer", () => {
  const id = extractUrlId("/aio/" + SAMPLE);
  const hit = lookupUrlId(mockIndex, id);
  assert.equal(hit?.questionId, "1.1");
});
check("unknown id → null", () => assert.equal(lookupUrlId(mockIndex, "NOPE"), null));
check("null index → null", () => assert.equal(lookupUrlId(null, SAMPLE), null));
check("null id → null", () => assert.equal(lookupUrlId(mockIndex, null), null));
check("prototype key not matched (hasOwnProperty)", () =>
  assert.equal(lookupUrlId(mockIndex, "toString"), null),
);

console.log(`\n${pass} checks passed.`);
