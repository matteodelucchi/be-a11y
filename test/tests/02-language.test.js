/**
 * Test language detection utility
 */

const { TestRunner } = require("../framework");

// We need to create a mock cheerio for testing without dependencies
// Since we can't install npm packages, we'll test the logic directly

module.exports.register = function (runner) {
  // Test the constants and helper functions that don't require cheerio
  runner.addTest("language: DEFAULT_LANGUAGE is 'en'", () => {
    const lang = require("../../src/utils/language");
    runner.assertEqual(
      lang.DEFAULT_LANGUAGE,
      "en",
      "Default language should be 'en'"
    );
  });

  runner.addTest("language: GERMAN_LANGUAGES includes variants", () => {
    const lang = require("../../src/utils/language");
    runner.assert(
      lang.GERMAN_LANGUAGES.includes("de") &&
      lang.GERMAN_LANGUAGES.includes("de-de") &&
      lang.GERMAN_LANGUAGES.includes("de-at"),
      "German languages should include de, de-de, de-at"
    );
  });

  runner.addTest("language: isGerman returns true for German codes", () => {
    const lang = require("../../src/utils/language");
    runner.assert(
      lang.isGerman("de") &&
      lang.isGerman("de-DE") &&
      lang.isGerman("de-at") &&
      !lang.isGerman("en") &&
      !lang.isGerman("fr"),
      "isGerman should correctly identify German language codes"
    );
  });

  runner.addTest("language: isEnglish returns true for English codes", () => {
    const lang = require("../../src/utils/language");
    runner.assert(
      lang.isEnglish("en") &&
      lang.isEnglish("en-US") &&
      lang.isEnglish("en-gb") &&
      !lang.isEnglish("de") &&
      !lang.isEnglish("fr"),
      "isEnglish should correctly identify English language codes"
    );
  });

  runner.addTest("language: getLanguage with explicit German", () => {
    const lang = require("../../src/utils/language");
    const result = lang.getLanguage("", "de");
    runner.assertEqual(
      result,
      "de",
      "Should return 'de' when explicitly configured"
    );
  });

  runner.addTest("language: getLanguage with explicit English", () => {
    const lang = require("../../src/utils/language");
    const result = lang.getLanguage("", "en");
    runner.assertEqual(
      result,
      "en",
      "Should return 'en' when explicitly configured"
    );
  });

  runner.addTest("language: getLanguage falls back to default", () => {
    const lang = require("../../src/utils/language");
    const result = lang.getLanguage("", "fr"); // Unknown language
    runner.assertEqual(
      result,
      "en",
      "Should fall back to 'en' for unknown explicit language"
    );
  });

  // Test with null/undefined
  runner.addTest("language: detectLanguage with empty content", () => {
    const lang = require("../../src/utils/language");
    const result = lang.detectLanguage("");
    runner.assertEqual(
      result,
      "en",
      "Should return default language for empty content"
    );
  });

  runner.addTest("language: detectLanguage with null content", () => {
    const lang = require("../../src/utils/language");
    const result = lang.detectLanguage(null);
    runner.assertEqual(
      result,
      "en",
      "Should return default language for null content"
    );
  });

  runner.addTest("language: detectLanguage with non-string content", () => {
    const lang = require("../../src/utils/language");
    const result = lang.detectLanguage(123);
    runner.assertEqual(
      result,
      "en",
      "Should return default language for non-string content"
    );
  });
};
