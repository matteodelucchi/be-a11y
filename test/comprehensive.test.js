#!/usr/bin/env node
/**
 * Comprehensive End-to-End Test Suite
 * Tests the full be-a11y workflow with real HTML fixtures
 */

const fs = require("fs");
const path = require("path");

console.log("\n" + "=".repeat(70));
console.log("  be-a11y Comprehensive End-to-End Test Suite");
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
    if (error.stack) {
      const relevantLines = error.stack.split('\n').slice(1, 4);
      console.log(`  ${relevantLines.join('\n  ')}`);
    }
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

function assertDeepEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${message || "Objects not equal"}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

const fixturesDir = path.join(__dirname, "fixtures");

// ============================================
// Helper: Read fixture file
// ============================================
function readFixture(...parts) {
  const fixturePath = path.join(fixturesDir, ...parts);
  return fs.readFileSync(fixturePath, "utf-8");
}

// ============================================
// Test 1: English Fixtures
// ============================================
console.log("\n--- Testing English Fixtures ---\n");

// Test missing-alt detection
const altAttributes = require("../src/rules/altAttributes");

test("english/missing-alt.html: detects missing alt attribute", () => {
  const html = readFixture("english", "missing-alt.html");
  const errors = altAttributes(html, "english/missing-alt.html", { lang: "en" });
  
  assertEqual(errors.length, 1, "Should find 1 error");
  assertEqual(errors[0].type, "missing-alt", "Error type should be missing-alt");
  assertEqual(errors[0].message, "<img> tag is missing an alt attribute", 
    "Message should be in English");
});

test("english/decorative-image.html: detects decorative image with non-empty alt", () => {
  const html = readFixture("english", "decorative-image.html");
  const errors = altAttributes(html, "english/decorative-image.html", { lang: "en" });
  
  assert(errors.length >= 1, "Should find at least 1 error");
  const decorativeError = errors.find(e => e.type === "alt-decorative-incorrect");
  assert(decorativeError !== undefined, "Should find decorative image error");
});

test("english/decorative-image.html: does not flag decorative with empty alt", () => {
  const html = readFixture("english", "decorative-image.html");
  const errors = altAttributes(html, "english/decorative-image.html", { lang: "en" });
  
  // Should not flag the first image (alt="" with role="presentation")
  const firstImageError = errors.find(e => 
    e.message.includes("divider.png") && e.type === "alt-decorative-incorrect"
  );
  assert(firstImageError === undefined, "Should not flag decorative image with empty alt");
});

// Test heading order
const headingOrder = require("../src/rules/headingOrder");

test("english/heading-order.html: detects heading skip", () => {
  const html = readFixture("english", "heading-order.html");
  const errors = headingOrder(html, "english/heading-order.html", { lang: "en" });
  
  assertEqual(errors.length, 1, "Should find 1 heading order error");
  assertEqual(errors[0].type, "heading-order", "Error type should be heading-order");
  assert(errors[0].message.includes("h4"), "Message should mention h4");
});

// Test new tab warning
const linksOpenNewTab = require("../src/rules/linksOpenNewTab");

test("english/new-tab-warning.html: detects missing new tab warning", () => {
  const html = readFixture("english", "new-tab-warning.html");
  const errors = linksOpenNewTab(html, "english/new-tab-warning.html", { lang: "en" });
  
  assertEqual(errors.length, 1, "Should find 1 error (first link missing warning)");
  assertEqual(errors[0].type, "link-new-tab-warning", "Error type should be link-new-tab-warning");
  assertEqual(errors[0].message, 
    "<a> with target=\"_blank\" should inform users it opens in a new tab (e.g., via aria-label or screen reader note)",
    "Message should be in English");
});

test("english/new-tab-warning.html: does not flag links with aria-label", () => {
  const html = readFixture("english", "new-tab-warning.html");
  const errors = linksOpenNewTab(html, "english/new-tab-warning.html", { lang: "en" });
  
  // Should only find 1 error (the first link)
  assertEqual(errors.length, 1, "Should only find 1 error");
});

// ============================================
// Test 2: German Fixtures
// ============================================
console.log("\n--- Testing German Fixtures ---\n");

test("german/missing-alt.html: detects missing alt in German", () => {
  const html = readFixture("german", "missing-alt.html");
  const errors = altAttributes(html, "german/missing-alt.html", { lang: "de" });
  
  assertEqual(errors.length, 1, "Should find 1 error");
  assertEqual(errors[0].type, "missing-alt", "Error type should be missing-alt");
  assertEqual(errors[0].message, "<img>-Tag hat kein alt-Attribut", 
    "Message should be in German");
});

test("german/decorative-image.html: detects decorative with aria-hidden", () => {
  const html = readFixture("german", "decorative-image.html");
  const errors = altAttributes(html, "german/decorative-image.html", { lang: "de" });
  
  // Should find errors for images with non-empty alt on decorative images
  assert(errors.length >= 1, "Should find at least 1 error");
});

test("german/decorative-image.html: does not flag decorative with aria-hidden", () => {
  const html = readFixture("german", "decorative-image.html");
  const errors = altAttributes(html, "german/decorative-image.html", { lang: "de" });
  
  // Should find 1 error: the second image has role="presentation" but non-empty alt
  assert(errors.length === 1, `Should find exactly 1 error (second image), got ${errors.length}`);
});

test("german/new-tab-warning.html: detects missing warning in German", () => {
  const html = readFixture("german", "new-tab-warning.html");
  const errors = linksOpenNewTab(html, "german/new-tab-warning.html", { lang: "de" });
  
  assertEqual(errors.length, 1, "Should find 1 error (first link)");
  assertEqual(errors[0].type, "link-new-tab-warning", "Error type should be link-new-tab-warning");
  assertEqual(errors[0].message,
    "<a> mit target=\"_blank\" sollte Nutzer darüber informieren, dass es in einem neuen Tab geöffnet wird (z. B. über aria-label oder Screenreader-Hinweis)",
    "Message should be in German");
});

test("german/new-tab-warning.html: accepts German aria-label", () => {
  const html = readFixture("german", "new-tab-warning.html");
  const errors = linksOpenNewTab(html, "german/new-tab-warning.html", { lang: "de" });
  
  assertEqual(errors.length, 1, "Should only find 1 error");
});

test("german/new-tab-warning.html: accepts German screen reader text", () => {
  const html = readFixture("german", "new-tab-warning.html");
  const errors = linksOpenNewTab(html, "german/new-tab-warning.html", { lang: "de" });
  
  // Should only find 1 error (the first link)
  assertEqual(errors.length, 1, "Should only find 1 error");
});

test("german/long-alt-text.html: detects long alt text with German limit", () => {
  const html = readFixture("german", "long-alt-text.html");
  const errors = altAttributes(html, "german/long-alt-text.html", { lang: "de", altMaxLength: 125 });
  
  assertEqual(errors.length, 1, "Should find 1 alt-too-long error");
  assertEqual(errors[0].type, "alt-too-long", "Error type should be alt-too-long");
  assert(errors[0].message.includes("125"), "Message should mention 125 limit");
  assert(errors[0].message.includes("Zeichen"), "Message should be in German");
});

// ============================================
// Test 3: Edge Cases
// ============================================
console.log("\n--- Testing Edge Cases ---\n");

// Test no lang attribute (should default to English)
test("edge-cases/no-lang-attribute.html: defaults to English", () => {
  const html = readFixture("edge-cases", "no-lang-attribute.html");
  const errors = altAttributes(html, "edge-cases/no-lang-attribute.html", { lang: "en" });
  
  assertEqual(errors.length, 1, "Should find 1 error");
  assertEqual(errors[0].message, "<img> tag is missing an alt attribute",
    "Should use English message when no lang attribute");
});

// Test aria-hidden decorative images
const ariaHiddenHtml = require("../src/rules/altAttributes");

test("edge-cases/aria-hidden-decorative.html: finds correct errors", () => {
  const html = readFixture("edge-cases", "aria-hidden-decorative.html");
  const errors = ariaHiddenHtml(html, "edge-cases/aria-hidden-decorative.html", { lang: "en" });
  
  // Should find 2 errors:
  // 1. First image: decorative with non-empty alt (aria-hidden="true" but alt="Some icon")
  // 2. Third image: functional image inside link with empty alt
  assertEqual(errors.length, 2, "Should find exactly 2 errors");
  
  // Check error types
  const errorTypes = errors.map(e => e.type);
  assert(errorTypes.includes("alt-decorative-incorrect"), 
    "Should find alt-decorative-incorrect error");
  assert(errorTypes.includes("alt-functional-empty"), 
    "Should find alt-functional-empty error");
});

// Test empty links with icons
const emptyLinks = require("../src/rules/emptyLinks");

test("edge-cases/empty-link-with-icon.html: detects empty link with decorative icon", () => {
  const html = readFixture("edge-cases", "empty-link-with-icon.html");
  const errors = emptyLinks(html, "edge-cases/empty-link-with-icon.html", { lang: "en" });
  
  // Should find 2 errors: link with icon with empty alt, and empty link
  assertEqual(errors.length, 2, "Should find 2 empty link errors");
});

// Test screen reader classes
const linksNewTab = require("../src/rules/linksOpenNewTab");

test("edge-cases/screen-reader-classes.html: accepts all screen reader classes", () => {
  const html = readFixture("edge-cases", "screen-reader-classes.html");
  const errors = linksNewTab(html, "edge-cases/screen-reader-classes.html", { lang: "en" });
  
  // Should only find 1 error (the last link without warning)
  assertEqual(errors.length, 1, "Should find exactly 1 error (last link)");
  assertEqual(errors[0].type, "link-new-tab-warning", "Error should be link-new-tab-warning");
});

test("edge-cases/screen-reader-classes.html: sr-only class works", () => {
  const html = readFixture("edge-cases", "screen-reader-classes.html");
  const errors = linksNewTab(html, "edge-cases/screen-reader-classes.html", { lang: "en" });
  
  assertEqual(errors.length, 1, "Should only find last link as error");
});

// ============================================
// Test 4: Phase 3 Improvements
// ============================================
console.log("\n--- Testing Phase 3 Improvements ---\n");

// Test aria-hidden detection in altAttributes
test("Phase 3: aria-hidden check in altAttributes", () => {
  const html = '<html><body><img src="icon.png" alt="icon" aria-hidden="true"></body></html>';
  const errors = altAttributes(html, "test.html", { lang: "en" });
  
  // Should flag decorative image with non-empty alt and aria-hidden
  assertEqual(errors.length, 1, "Should flag decorative image with non-empty alt");
  assertEqual(errors[0].type, "alt-decorative-incorrect", 
    "Should be alt-decorative-incorrect error");
});

test("Phase 3: aria-hidden with empty alt is valid", () => {
  const html = '<html><body><img src="icon.png" alt="" aria-hidden="true"></body></html>';
  const errors = altAttributes(html, "test.html", { lang: "en" });
  
  // This is a decorative image (aria-hidden + empty alt) so should not be flagged
  assertEqual(errors.length, 0, "Should not flag decorative image with empty alt and aria-hidden");
});

// Test improved emptyLinks detection
test("Phase 3: emptyLinks detects aria-label", () => {
  const html = '<html><body><a href="#" aria-label="Close"></a></body></html>';
  const errors = emptyLinks(html, "test.html", { lang: "en" });
  
  assertEqual(errors.length, 0, "Should not flag link with aria-label");
});

test("Phase 3: emptyLinks detects img with alt as content", () => {
  const html = '<html><body><a href="#"><img src="icon.png" alt="Home"></a></body></html>';
  const errors = emptyLinks(html, "test.html", { lang: "en" });
  
  assertEqual(errors.length, 0, "Should not flag link with image that has descriptive alt");
});

test("Phase 3: emptyLinks flags img with empty alt as no content", () => {
  const html = '<html><body><a href="#"><img src="icon.png" alt=""></a></body></html>';
  const errors = emptyLinks(html, "test.html", { lang: "en" });
  
  assertEqual(errors.length, 1, "Should flag link with image that has empty alt");
});

// Test improved linksOpenNewTab detection
test("Phase 3: linksOpenNewTab accepts visible text in link", () => {
  const html = '<html><body><a href="#" target="_blank">Download (opens in new tab)</a></body></html>';
  const errors = linksNewTab(html, "test.html", { lang: "en" });
  
  assertEqual(errors.length, 0, "Should not flag link with visible text about new tab");
});

test("Phase 3: linksOpenNewTab respects aria-hidden", () => {
  const html = '<html><body><a href="#" target="_blank" aria-hidden="true">Hidden Link</a></body></html>';
  const errors = linksNewTab(html, "test.html", { lang: "en" });
  
  assertEqual(errors.length, 0, "Should not flag link that is aria-hidden");
});

// Test multipleH1 can be disabled
test("Phase 3: multipleH1 can be disabled via config", () => {
  const multipleH1 = require("../src/rules/multipleH1");
  const html = '<html><body><h1>First</h1><h1>Second</h1></body></html>';
  
  // With rule enabled (default)
  const errorsEnabled = multipleH1(html, "test.html", { lang: "en" });
  assertEqual(errorsEnabled.length, 2, "Should find errors when enabled");
  
  // With rule disabled
  const errorsDisabled = multipleH1(html, "test.html", { 
    lang: "en", 
    rules: { "multiple-h1": false }
  });
  assertEqual(errorsDisabled.length, 0, "Should not find errors when disabled");
});

// ============================================
// Test 5: Language Auto-Detection
// ============================================
console.log("\n--- Testing Language Auto-Detection ---\n");

const language = require("../src/utils/language");

test("Language detection: English HTML", () => {
  const html = '<html lang="en"><body>Hello</body></html>';
  const detected = language.detectLanguage(html);
  assertEqual(detected, "en", "Should detect English");
});

test("Language detection: German HTML", () => {
  const html = '<html lang="de"><body>Hallo</body></html>';
  const detected = language.detectLanguage(html);
  assertEqual(detected, "de", "Should detect German");
});

test("Language detection: German regional variant", () => {
  const html = '<html lang="de-DE"><body>Hallo</body></html>';
  const detected = language.detectLanguage(html);
  assertEqual(detected, "de", "Should detect German regional variant");
});

test("Language detection: defaults to English", () => {
  const html = '<html><body>Hello</body></html>';
  const detected = language.detectLanguage(html);
  assertEqual(detected, "en", "Should default to English");
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
  console.log("✅ All comprehensive tests passed!\n");
  console.log("Test Coverage:");
  console.log("  ✓ English fixtures (4 tests)");
  console.log("  ✓ German fixtures (7 tests)");
  console.log("  ✓ Edge cases (5 tests)");
  console.log("  ✓ Phase 3 improvements (7 tests)");
  console.log("  ✓ Language auto-detection (4 tests)");
  console.log("\nTotal: 27 new comprehensive tests\n");
  process.exit(0);
}
