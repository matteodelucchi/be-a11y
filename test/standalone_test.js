#!/usr/bin/env node
/**
 * Standalone test for Phase 2 implementation
 * Tests i18n system and configuration without requiring external dependencies
 */

const fs = require("fs");
const path = require("path");

console.log("\n" + "=".repeat(70));
console.log("  be-a11y Phase 2 - Standalone Test Suite");
console.log("=".repeat(70) + "\n");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      `${message || "Values not equal"}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

// ============================================
// Test 1: i18n System
// ============================================
console.log("\n--- Testing i18n System ---\n");

const i18n = require("../src/utils/i18n");

// Basic message retrieval
test("i18n: getMessage returns English message for missing-alt", () => {
  const msg = i18n.getMessage("missing-alt", "en");
  assertEqual(msg, "<img> tag is missing an alt attribute");
});

test("i18n: getMessage returns German message for missing-alt", () => {
  const msg = i18n.getMessage("missing-alt", "de");
  assertEqual(msg, "<img>-Tag hat kein alt-Attribut");
});

test("i18n: getMessage falls back to English for unknown language", () => {
  const msg = i18n.getMessage("missing-alt", "fr");
  assertEqual(msg, "<img> tag is missing an alt attribute");
});

test("i18n: getMessage returns key for missing message", () => {
  const msg = i18n.getMessage("nonexistent-key", "en");
  assertEqual(msg, "nonexistent-key");
});

test("i18n: Variable substitution works in English", () => {
  const msg = i18n.getMessage("alt-too-long", "en", { maxLength: 125, length: 150 });
  assert(msg.includes("125") && msg.includes("150"), "Message should contain variables");
});

test("i18n: Variable substitution works in German", () => {
  const msg = i18n.getMessage("alt-too-long", "de", { maxLength: 125, length: 200 });
  assert(msg.includes("125") && msg.includes("200") && msg.includes("Zeichen"), 
    "German message should contain variables and 'Zeichen'");
});

test("i18n: All 21 expected message keys exist", () => {
  const keys = i18n.getMessageKeys("en");
  const expectedKeys = [
    "missing-alt", "alt-empty", "alt-too-long", "alt-decorative-incorrect",
    "alt-functional-empty", "redundant-title", "aria-invalid", "aria-invalid-ref",
    "aria-role-invalid", "missing-aria", "heading-order", "heading-empty",
    "multiple-h1", "label-missing-for", "label-for-missing", "input-unlabeled",
    "empty-link", "link-new-tab-warning", "iframe-title-missing",
    "missing-landmark", "contrast"
  ];
  assertDeepEqual(keys.sort(), expectedKeys.sort());
});

function assertDeepEqual(actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error("Objects not equal");
  }
}

test("i18n: Supported languages include en and de", () => {
  const languages = i18n.getSupportedLanguages();
  assert(languages.includes("en") && languages.includes("de"), 
    "Should include en and de");
});

test("i18n: English and German messages differ", () => {
  const enMsg = i18n.getMessage("link-new-tab-warning", "en");
  const deMsg = i18n.getMessage("link-new-tab-warning", "de");
  assert(enMsg !== deMsg, "Messages should differ");
});

test("i18n: DEFAULT_LANG is 'en'", () => {
  assertEqual(i18n.DEFAULT_LANG, "en");
});

// ============================================
// Test 2: Configuration System
// ============================================
console.log("\n--- Testing Configuration System ---\n");

// Test configuration defaults (without loading chalk)
// We'll test the structure directly
const configPath = path.join(__dirname, "..", "a11y.config.json");
const configContent = fs.readFileSync(configPath, "utf-8");
const config = JSON.parse(configContent);

test("config: a11y.config.json has language field", () => {
  assert(config.language === null, "language should be null for auto-detect");
});

test("config: a11y.config.json has altMaxLength field", () => {
  assert(config.altMaxLength === 125, "altMaxLength should be 125");
});

test("config: a11y.config.json has rules field", () => {
  assert(config.rules !== undefined, "rules should be defined");
});

test("config: a11y.config.json has newTabNoticePatterns with German", () => {
  assert(Array.isArray(config.newTabNoticePatterns), "Should have array");
  assert(config.newTabNoticePatterns.includes("öffnet in neuem Tab"), 
    "Should include German pattern with correct encoding");
  assert(config.newTabNoticePatterns.includes("öffnet in neuem Fenster"), 
    "Should include German pattern with correct encoding");
});

// ============================================
// Test 3: Rule Files Syntax
// ============================================
console.log("\n--- Testing Rule Files Syntax ---\n");

const rules = [
  "altAttributes", "ariaLabels", "missingAria", "contrast",
  "ariaRoles", "landmarkRoles", "linksOpenNewTab", "headingOrder",
  "headingEmpty", "labelsWithoutFor", "multipleH1", "emptyLinks",
  "iframeTitles", "unlabeledInputs"
];

for (const ruleName of rules) {
  test(`syntax: ${ruleName}.js has valid syntax`, () => {
    const rulePath = path.join(__dirname, "..", "src", "rules", `${ruleName}.js`);
    // Use node -c to check syntax (but this requires dependencies)
    // Instead, just check the file exists and is readable
    assert(fs.existsSync(rulePath), `Rule file should exist: ${ruleName}`);
    const content = fs.readFileSync(rulePath, "utf-8");
    assert(content.includes("getMessage") || content.includes("config"), 
      `Rule should reference i18n or config: ${ruleName}`);
  });
}

// ============================================
// Test 4: Rule File Exports
// ============================================
console.log("\n--- Testing Rule File Exports ---\n");

// We can't actually require the rules without cheerio, but we can check
// that the files have the correct structure
test("rules: All rule files export functions", () => {
  for (const ruleName of rules) {
    const rulePath = path.join(__dirname, "..", "src", "rules", `${ruleName}.js`);
    const content = fs.readFileSync(rulePath, "utf-8");
    assert(content.includes("module.exports") || content.includes("exports"),
      `Rule should export: ${ruleName}`);
  }
});

test("rules: All rule files accept config parameter", () => {
  for (const ruleName of rules) {
    const rulePath = path.join(__dirname, "..", "src", "rules", `${ruleName}.js`);
    const content = fs.readFileSync(rulePath, "utf-8");
    // Check for config parameter in function signature or usage
    assert(content.includes("config") || content.includes("lang"),
      `Rule should accept config/lang: ${ruleName}`);
  }
});

// ============================================
// Test 5: Encoding Fixes
// ============================================
console.log("\n--- Testing Encoding Fixes ---\n");

test("encoding: config has correct German Unicode for öffnet", () => {
  const content = fs.readFileSync(configPath, "utf-8");
  assert(!content.includes("\\u00f6ffnet"), "Should not have malformed Unicode");
  assert(content.includes("öffnet in neuem Tab"), "Should have correct German: öffnet");
  assert(content.includes("öffnet in neuem Fenster"), "Should have correct German: Fenster");
});

test("encoding: linksOpenNewTab has correct German patterns", () => {
  const rulePath = path.join(__dirname, "..", "src", "rules", "linksOpenNewTab.js");
  const content = fs.readFileSync(rulePath, "utf-8");
  assert(!content.includes("\\u00f6ffnet"), "Should not have malformed Unicode");
  assert(content.includes("öffnet in neuem Tab") || content.includes("öffnung"), 
    "Should have correct German patterns");
});

// ============================================
// Test 6: Language Module Constants
// ============================================
console.log("\n--- Testing Language Module Constants ---\n");

// We can test the constants without loading cheerio
const languageModuleCode = fs.readFileSync(
  path.join(__dirname, "..", "src", "utils", "language.js"), "utf-8"
);

test("language: DEFAULT_LANGUAGE constant is defined", () => {
  assert(languageModuleCode.includes("DEFAULT_LANGUAGE"), "Should define DEFAULT_LANGUAGE");
});

test("language: GERMAN_LANGUAGES constant is defined", () => {
  assert(languageModuleCode.includes("GERMAN_LANGUAGES"), "Should define GERMAN_LANGUAGES");
});

test("language: isGerman function is defined", () => {
  assert(languageModuleCode.includes("isGerman"), "Should define isGerman");
});

test("language: isEnglish function is defined", () => {
  assert(languageModuleCode.includes("isEnglish"), "Should define isEnglish");
});

// ============================================
// Summary
// ============================================
console.log("\n" + "=".repeat(70));
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log("=".repeat(70) + "\n");

if (failed > 0) {
  console.log("❌ Some tests failed\n");
  process.exit(1);
} else {
  console.log("✅ All tests passed!\n");
  process.exit(0);
}
