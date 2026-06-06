/**
 * Integration test - test full workflow
 */

const { TestRunner } = require("../framework");
const fs = require("fs");
const path = require("path");

module.exports.register = function (runner) {
  // Create temporary test directory
  const testDir = path.join(__dirname, "temp-test-dir");
  const originalDir = process.cwd();

  // Clean up before tests
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }

  // Setup: Create test directory
  beforeAll = () => {
    fs.mkdirSync(testDir, { recursive: true });
  };

  // Teardown: Clean up after tests
  afterAll = () => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  };

  runner.addTest("integration: configuration loads correctly", () => {
    const config = require("../../src/utils/configuration");
    const loaded = config("../../a11y.config.json");
    
    runner.assert(
      loaded !== null && loaded !== undefined,
      "Configuration should load successfully"
    );
    runner.assert(
      loaded.rules !== undefined,
      "Configuration should have rules"
    );
    runner.assert(
      loaded.language === null,
      "Configuration should have language set to null (auto-detect)"
    );
    runner.assert(
      loaded.altMaxLength === 125,
      "Configuration should have altMaxLength set to 125"
    );
  });

  runner.addTest("integration: all 14 rules can be required", () => {
    const rules = [
      "altAttributes",
      "ariaLabels",
      "missingAria",
      "contrast",
      "ariaRoles",
      "landmarkRoles",
      "linksOpenNewTab",
      "headingOrder",
      "headingEmpty",
      "labelsWithoutFor",
      "multipleH1",
      "emptyLinks",
      "iframeTitles",
      "unlabeledInputs",
    ];

    for (const ruleName of rules) {
      const rule = require(`../../src/rules/${ruleName}`);
      runner.assert(
        typeof rule === "function",
        `Rule ${ruleName} should export a function`
      );
    }
  });

  runner.addTest("integration: i18n and language modules work together", () => {
    const i18n = require("../../src/utils/i18n");
    const lang = require("../../src/utils/language");
    
    // Test basic functionality
    runner.assert(
      i18n.getMessage("missing-alt", "en") !== i18n.getMessage("missing-alt", "de"),
      "English and German messages should differ"
    );
    
    runner.assert(
      lang.isGerman("de"),
      "isGerman should identify German language"
    );
    
    runner.assert(
      lang.isEnglish("en"),
      "isEnglish should identify English language"
    );
  });

  runner.addTest("integration: complete workflow with English HTML", () => {
    // Create a test HTML file with English language
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head><title>Test</title></head>
<body>
  <img src="image.jpg" alt="">
  <a href="https://example.com" target="_blank">Link without warning</a>
</body>
</html>
    `;
    const testFile = path.join(testDir, "english.html");
    fs.writeFileSync(testFile, htmlContent, "utf-8");

    // Run altAttributes rule
    const altRule = require("../../src/rules/altAttributes");
    const altErrors = altRule(htmlContent, testFile, { lang: "en" });
    
    runner.assert(
      altErrors.length > 0,
      "Should find alt attribute error"
    );
    runner.assert(
      altErrors[0].message === "<img> tag is missing an alt attribute",
      "Error message should be in English"
    );

    // Run linksOpenNewTab rule
    const linkRule = require("../../src/rules/linksOpenNewTab");
    const linkErrors = linkRule(htmlContent, testFile, { lang: "en" });
    
    runner.assert(
      linkErrors.length > 0,
      "Should find new tab warning error"
    );
    runner.assert(
      linkErrors[0].type === "link-new-tab-warning",
      "Error type should be link-new-tab-warning"
    );
  });

  runner.addTest("integration: complete workflow with German HTML", () => {
    // Create a test HTML file with German language
    const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head><title>Test</title></head>
<body>
  <img src="bild.jpg" alt="">
  <a href="https://beispiel.de" target="_blank">Link ohne Hinweis</a>
</body>
</html>
    `;
    const testFile = path.join(testDir, "german.html");
    fs.writeFileSync(testFile, htmlContent, "utf-8");

    // Run altAttributes rule with German
    const altRule = require("../../src/rules/altAttributes");
    const altErrors = altRule(htmlContent, testFile, { lang: "de" });
    
    runner.assert(
      altErrors.length > 0,
      "Should find alt attribute error"
    );
    runner.assert(
      altErrors[0].message === "<img>-Tag hat kein alt-Attribut",
      "Error message should be in German"
    );

    // Run linksOpenNewTab rule with German
    const linkRule = require("../../src/rules/linksOpenNewTab");
    const linkErrors = linkRule(htmlContent, testFile, { lang: "de" });
    
    runner.assert(
      linkErrors.length > 0,
      "Should find new tab warning error"
    );
  });

  runner.addTest("integration: altMaxLength configuration is respected", () => {
    const htmlContent = '<html><img src="test.jpg" alt="This is a somewhat long alt text that exceeds fifty characters"></html>';
    
    // With default altMaxLength (125), should pass
    const altRule = require("../../src/rules/altAttributes");
    const resultDefault = altRule(htmlContent, "test.html", { lang: "en" });
    runner.assert(
      !resultDefault.some(e => e.type === "alt-too-long"),
      "Should not find alt-too-long error with default limit (125)"
    );

    // With custom altMaxLength (50), should fail
    const resultCustom = altRule(htmlContent, "test.html", { lang: "en", altMaxLength: 50 });
    runner.assert(
      resultCustom.some(e => e.type === "alt-too-long"),
      "Should find alt-too-long error with custom limit (50)"
    );
  });

  runner.addTest("integration: German altMaxLength is suitable", () => {
    // German text tends to be longer, so 125 chars is more appropriate
    const htmlContent = '<html><img src="test.jpg" alt="Dies ist ein sehr langer Alternativtext der die typische Länge von deutschen Beschreibungen widerspiegelt und daher die 125 Zeichen Grenze überschreitet"></html>';
    
    const altRule = require("../../src/rules/altAttributes");
    
    // With 125 limit (default for German), should pass or be close
    const result = altRule(htmlContent, "test.html", { lang: "de", altMaxLength: 125 });
    const altText = htmlContent.match(/alt="([^"]*)"/)[1];
    
    runner.assert(
      altText.length <= 125 || result.some(e => e.type === "alt-too-long"),
      "Should either pass (alt <= 125) or flag as too long"
    );
  });

  runner.addTest("integration: all error types have translations", () => {
    const i18n = require("../../src/utils/i18n");
    const allKeys = i18n.getMessageKeys("en");
    
    // Check that we have translations for all the error types used in rules
    const requiredKeys = [
      "missing-alt",
      "alt-empty",
      "alt-too-long",
      "alt-decorative-incorrect",
      "alt-functional-empty",
      "aria-invalid",
      "aria-invalid-ref",
      "aria-role-invalid",
      "missing-aria",
      "heading-order",
      "heading-empty",
      "multiple-h1",
      "label-missing-for",
      "label-for-missing",
      "input-unlabeled",
      "empty-link",
      "link-new-tab-warning",
      "iframe-title-missing",
      "missing-landmark",
      "contrast",
    ];

    for (const key of requiredKeys) {
      runner.assert(
        allKeys.includes(key),
        `Should have translation for error type: ${key}`
      );
    }
  });
};
