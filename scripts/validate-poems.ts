#!/usr/bin/env node

/**
 * Validate the shape and basic integrity of data/poems.json.
 *
 * Run from the repo root, for example:
 *   npx ts-node scripts/validate-poems.ts
 *   npx tsx scripts/validate-poems.ts
 *
 * This script is intentionally self-contained and only uses Node core modules
 * so it can run in local dev and CI without any extra wiring.
 */

import * as fs from "fs";
import * as path from "path";

// Poem schema based on planning/content-schema.md.
// Note: transliteration is treated as optional at runtime even though all
// current entries provide it.
interface Poem {
  id: unknown;
  poetId: unknown;
  genre: unknown;
  original: unknown;
  transliteration?: unknown;
  translations: unknown;
  theme: unknown;
  // Allow for extra fields that we will report as unexpected.
  [key: string]: unknown;
}

interface ValidationIssue {
  poemIndex: number | null; // 1-based index; null for root-level issues
  poemId?: string; // best-effort capture of poem.id
  message: string;
}

const REQUIRED_KEYS: (keyof Poem)[] = [
  "id",
  "poetId",
  "genre",
  "original",
  "translations",
  "theme",
];

const ROOT = process.cwd();
const POEMS_PATH = path.join(ROOT, "data", "poems.json");

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function loadPoemsJson(filePath: string): unknown {
  let raw: string;

  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    throw new Error(`Failed to read ${path.relative(ROOT, filePath)}: ${(error as Error).message}`);
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Failed to parse ${path.relative(ROOT, filePath)} as JSON: ${(error as Error).message}`);
  }
}

function validatePoems(data: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!Array.isArray(data)) {
    issues.push({ poemIndex: null, message: "Top-level value must be an array of poems." });
    return issues;
  }

  const seenIds = new Map<string, number[]>(); // id -> indices (1-based)

  data.forEach((item, index) => {
    const poemIndex = index + 1;
    let poemId: string | undefined;

    if (!item || typeof item !== "object") {
      issues.push({ poemIndex, message: "Poem entry is not an object." });
      return;
    }

    const poem = item as Poem;

    // Track the raw id early for logging context where possible.
    if (typeof poem.id === "string") {
      poemId = poem.id;
      const existing = seenIds.get(poem.id) ?? [];
      existing.push(poemIndex);
      seenIds.set(poem.id, existing);
    }

    const addIssue = (message: string) => {
      issues.push({ poemIndex, poemId, message });
    };

    // id: required string, digits only
    if (!isNonEmptyString(poem.id)) {
      addIssue("Missing or invalid 'id' (non-empty string required).");
    } else if (!/^\d+$/.test(poem.id)) {
      addIssue("Invalid 'id' format: must contain digits only (e.g. '001').");
    }

    // poetId: required string (no cross-file checks here)
    if (!isNonEmptyString(poem.poetId)) {
      addIssue("Missing or invalid 'poetId' (non-empty string required).");
    }

    // genre: required string
    if (!isNonEmptyString(poem.genre)) {
      addIssue("Missing or invalid 'genre' (non-empty string required).");
    }

    // original: required non-empty string
    if (!isNonEmptyString(poem.original)) {
      addIssue("Missing or invalid 'original' (non-empty string required).");
    }

    // transliteration: optional, but when present must be a string
    if (Object.prototype.hasOwnProperty.call(poem, "transliteration")) {
      if (typeof poem.transliteration !== "string") {
        addIssue("Invalid 'transliteration' (must be a string when present).");
      }
    }

    // translations: required object, not null/array; at least en/tr non-empty strings, all values strings
    const translations = poem.translations;
    if (!translations || typeof translations !== "object" || Array.isArray(translations)) {
      addIssue(
        "Missing or invalid 'translations' (must be an object with at least 'en' and 'tr' non-empty string values).",
      );
    } else {
      const t = translations as Record<string, unknown>;

      if (!isNonEmptyString(t.en)) {
        addIssue("Missing or invalid 'translations.en' (non-empty string required).");
      }

      if (!isNonEmptyString(t.tr)) {
        addIssue("Missing or invalid 'translations.tr' (non-empty string required).");
      }

      // Check that all values (for any language key) are strings
      for (const [lang, value] of Object.entries(t)) {
        if (typeof value !== "string") {
          addIssue(`Invalid 'translations.${lang}' (must be a string).`);
        }
      }
    }

    // theme: required non-empty string
    if (!isNonEmptyString(poem.theme)) {
      addIssue("Missing or invalid 'theme' (non-empty string required).");
    }

    // Unexpected extra fields
    const knownKeys = new Set<string>([...REQUIRED_KEYS, "transliteration"]);
    for (const key of Object.keys(poem)) {
      if (!knownKeys.has(key)) {
        addIssue(`Unexpected field '${key}'.`);
      }
    }
  });

  // Check for globally unique ids
  for (const [id, indices] of seenIds.entries()) {
    if (indices.length > 1) {
      issues.push({
        poemIndex: null,
        poemId: id,
        message: `Duplicate 'id' '${id}' found in poem indices: ${indices.join(", ")}.`,
      });
    }
  }

  return issues;
}

function formatIssue(issue: ValidationIssue): string {
  const parts: string[] = [];

  if (issue.poemIndex != null) {
    parts.push(`Poem ${issue.poemIndex}`);
  } else {
    parts.push("Root");
  }

  if (issue.poemId) {
    parts.push(`id=${issue.poemId}`);
  }

  return `${parts.join(" ")}: ${issue.message}`;
}

function main(): void {
  let data: unknown;

  try {
    data = loadPoemsJson(POEMS_PATH);
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }

  const issues = validatePoems(data);

  if (issues.length === 0) {
    const count = Array.isArray(data) ? data.length : 0;
    console.log(`poems.json: OK (${count} poem(s) validated)`);
    process.exit(0);
  }

  console.error(`poems.json: found ${issues.length} issue(s)`);
  for (const issue of issues) {
    console.error(formatIssue(issue));
  }

  process.exit(1);
}

if (require.main === module) {
  // eslint-disable-next-line n/no-process-env
  main();
}
