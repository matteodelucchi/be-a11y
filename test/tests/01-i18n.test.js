/**
 * Test i18n message system
 */

const { TestRunner } = require("../framework");
const i18n = require("../../src/utils/i18n");

module.exports.register = function (runner) {
  // Test basic message retrieval
  runner.addTest("i18n: getMessage returns English message", () => {
    const msg = i18n.getMessage("missing-alt", "en");
    runner.assertEqual(
      msg,
      "<img> tag is missing an alt attribute",
      "English missing-alt message should match"
    );
  });

  runner.addTest("i18n: getMessage returns German message", () => {
    const msg = i18n.getMessage("missing-alt", "de");
    runner.assertEqual(
      msg,
      "<img>-Tag hat kein alt-Attribut",
      "German missing-alt message should match"
    );
  });

  // Test fallback to English
  runner.addTest("i18n: getMessage falls back to English for unknown language", () => {
    const msg = i18n.getMessage("missing-alt", "fr");
    runner.assertEqual(
      msg,
      "<img> tag is missing an alt attribute",
      "Should fallback to English for unknown language"
    );
  });

  // Test fallback to key for missing message
  runner.addTest("i18n: getMessage returns key for missing message", () => {
    const msg = i18n.getMessage("nonexistent-key", "en");
    runner.assertEqual(
      msg,
      "nonexistent-key",
      "Should return key for missing message"
    );
  });

  // Test variable substitution
  runner.addTest("i18n: getMessage substitutes variables in English", () => {
    const msg = i18n.getMessage("alt-too-long", "en", { maxLength: 125, length: 150 });
    runner.assert(
      msg.includes("125") && msg.includes("150"),
      "Message should contain both variable values"
    );
  });

  runner.addTest("i18n: getMessage substitutes variables in German", () => {
    const msg = i18n.getMessage("alt-too-long", "de", { maxLength: 125, length: 200 });
    runner.assert(
      msg.includes("125") && msg.includes("200") && msg.includes("Zeichen"),
      "German message should contain variables and 'Zeichen'"
    );
  });

  // Test all message keys
  runner.addTest("i18n: all expected message keys exist", () => {
    const keys = i18n.getMessageKeys("en");
    const expectedKeys = [
      "missing-alt",
      "alt-empty",
      "alt-too-long",
      "alt-decorative-incorrect",
      "alt-functional-empty",
      "redundant-title",
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
    runner.assertDeepEqual(
      keys.sort(),
      expectedKeys.sort(),
      "All expected message keys should exist"
    );
  });

  // Test supported languages
  runner.addTest("i18n: supported languages include en and de", () => {
    const languages = i18n.getSupportedLanguages();
    runner.assert(
      languages.includes("en") && languages.includes("de"),
      "Supported languages should include en and de"
    );
  });

  // Test German messages are different from English
  runner.addTest("i18n: German messages differ from English", () => {
    const deMsg = i18n.getMessage("link-new-tab-warning", "de");
    const enMsg = i18n.getMessage("link-new-tab-warning", "en");
    runner.assert(
      deMsg !== enMsg,
      "German and English messages should be different"
    );
  });

  // Test default language
  runner.addTest("i18n: DEFAULT_LANG is 'en'", () => {
    runner.assertEqual(i18n.DEFAULT_LANG, "en", "Default language should be 'en'");
  });

  // Test all German messages exist
  runner.addTest("i18n: all message keys have German translations", () => {
    const enKeys = i18n.getMessageKeys("en");
    const deKeys = i18n.getMessageKeys("de");
    runner.assertEqual(
      enKeys.length,
      deKeys.length,
      "English and German should have same number of message keys"
    );
  });
};
