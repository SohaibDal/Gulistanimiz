#!/usr/bin/env ts-node

/**
 * Validate the shape and basic integrity of data/poems.json.
 *
 * Run from the repo root, for example:
 *   npx ts-node scripts/validate-poems.ts
 */

import * as fs from "fs";
import * as path from "path";

interface PoemTranslations {
  en: string;
  tr: string;
  // Allow additional languages without validating them explicitly
  [key: string]: unknown;
}

interface Poem {
  id: string;
  poem_id: string;
  poetId: string;
  genre: string;
  original: string;
  transliteration: string;
  translations: PoemTranslations;
  theme: string;
  // Allow extra properties without validating them explicitly
  [key: string]: unknown;
}

interface ValidationResult {
  issues: string[];
  poemsWithIssues: number;
}

const ROOT = process.cwd();
const POEMS_PATH = path.join(ROOT, "data", "poems.json");
const POETS_PATH = path.join(ROOT, "data", "poets.json");

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function loadJsonFile(filePath: string): unknown {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in ${filePath}: ${(error as Error).message}`);
  }
}

function loadPoetIds(): Set<string> {
  try {
    const poetsData = loadJsonFile(POETS_PATH);
    if (!Array.isArray(poetsData)) {
      return new Set();
    }
    const ids = poetsData
      .map((poet) => (poet && typeof poet === "object" ? (poet as { id?: unknown }).id : undefined))
      .filter((id): id is string => typeof id === "string" && id.length > 0);
    return new Set(ids);
  } catch {
    // If poets.json is missing or invalid, skip cross-file validation silently.
    return new Set();
  }
}

function validatePoems(data: unknown): ValidationResult {
  const issues: string[] = [];
  let poemsWithIssues = 0;

  if (!Array.isArray(data)) {
    issues.push("Root value is not an array of poems.");
    return { issues, poemsWithIssues };
  }

  const poetIds = loadPoetIds();
  const seenIds = new Map<string, number[]>();
  const seenPoemIds = new Map<string, number[]>();

  data.forEach((item, index) => {
    const poemIssues: string[] = [];
    const label = `Poem ${index + 1}`;

    if (!item || typeof item !== "object") {
      poemIssues.push("Value is not an object.");
    } else {
      const poem = item as Poem;

      if (!isNonEmptyString(poem.id)) {
        poemIssues.push("Missing or invalid 'id' (non-empty string required).");
      } else {
        const indices = seenIds.get(poem.id) ?? [];
        indices.push(index + 1);
        seenIds.set(poem.id, indices);
      }

      if (!isNonEmptyString(poem.poem_id)) {
        poemIssues.push("Missing or invalid 'poem_id' (non-empty string required).");
      } else {
        const indices = seenPoemIds.get(poem.poem_id) ?? [];
        indices.push(index + 1);
        seenPoemIds.set(poem.poem_id, indices);
      }

      if (!isNonEmptyString(poem.poetId)) {
        poemIssues.push("Missing or invalid 'poetId' (non-empty string required).");
      } else if (poetIds.size > 0 && !poetIds.has(poem.poetId)) {
        poemIssues.push(`Unknown 'poetId' '${poem.poetId}' (not found in poets.json).`);
      }

      if (!isNonEmptyString(poem.genre)) {
        poemIssues.push("Missing or invalid 'genre' (non-empty string required).");
      }

      if (!isNonEmptyString(poem.original)) {
        poemIssues.push("Missing or invalid 'original' (non-empty string required).");
      }

      if (!isNonEmptyString(poem.transliteration)) {
        poemIssues.push("Missing or invalid 'transliteration' (non-empty string required).");
      }

      if (!poem.translations || typeof poem.translations !== "object") {
        poemIssues.push("Missing or invalid 'translations' (object with at least 'en' and 'tr' required).");
      } else {
        const translations = poem.translations as Record<string, unknown>;
        if (!isNonEmptyString(translations.en)) {
          poemIssues.push("Missing or invalid 'translations.en' (non-empty string required).");
        }
        if (!isNonEmptyString(translations.tr)) {
          poemIssues.push("Missing or invalid 'translations.tr' (non-empty string required).");
        }
      }

      if (!isNonEmptyString(poem.theme)) {
        poemIssues.push("Missing or invalid 'theme' (non-empty string required).");
      }
    }

    if (poemIssues.length > 0) {
      poemsWithIssues += 1;
      issues.push(`${label}:`);
      poemIssues.forEach((issue) => {
        issues.push(`  - ${issue}`);
      });
    }
  });

  // Duplicate checks across poems
  seenIds.forEach((indices, id) => {
    if (indices.length > 1) {
      issues.push(`Duplicate 'id' '${id}' found in poems: ${indices.join(", ")}.`);
    }
  });

  seenPoemIds.forEach((indices, poemId) => {
    if (indices.length > 1) {
      issues.push(`Duplicate 'poem_id' '${poemId}' found in poems: ${indices.join(", ")}.`);
    }
  });

  return { issues, poemsWithIssues };
}

function main(): void {
  try {
    const data = loadJsonFile(POEMS_PATH);
    const { issues, poemsWithIssues } = validatePoems(data);

    if (issues.length === 0) {
      console.log("poems.json validation passed: no issues found.");
      process.exit(0);
    }

    issues.forEach((issue) => {
      console.error(issue);
    });

    console.error(`\nFound ${issues.length} issues in ${poemsWithIssues} poem(s).`);
    process.exit(1);
  } catch (error) {
    console.error(`Error validating poems.json: ${(error as Error).message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
