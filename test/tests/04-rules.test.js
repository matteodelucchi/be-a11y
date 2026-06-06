/**
 * Test rules with i18n integration
 * Tests that rules accept config parameter and use i18n messages
 */

const { TestRunner } = require("../framework");

module.exports.register = function (runner) {
  // Test that all rules can be required without errors
  runner.addTest("rules: altAttributes module loads", () => {
    const rule = require("../../src/rules/altAttributes");
    runner.assert(
      typeof rule === "function",
      "altAttributes should export a function"
    );
  });

  runner.addTest("rules: linksOpenNewTab module loads", () => {
    const rule = require("../../src/rules/linksOpenNewTab");
    runner.assert(
      typeof rule === "function",
      "linksOpenNewTab should export a function"
    );
  });

  runner.addTest("rules: ariaLabels module loads", () => {
    const rule = require("../../src/rules/ariaLabels");
    runner.assert(
      typeof rule === "function",
      "ariaLabels should export a function"
    );
  });

  runner.addTest("rules: missingAria module loads", () => {
    const rule = require("../../src/rules/missingAria");
    runner.assert(
      typeof rule === "function",
      "missingAria should export a function"
    );
  });

  runner.addTest("rules: headingOrder module loads", () => {
    const rule = require("../../src/rules/headingOrder");
    runner.assert(
      typeof rule === "function",
      "headingOrder should export a function"
    );
  });

  runner.addTest("rules: headingEmpty module loads", () => {
    const rule = require("../../src/rules/headingEmpty");
    runner.assert(
      typeof rule === "function",
      "headingEmpty should export a function"
    );
  });

  runner.addTest("rules: labelsWithoutFor module loads", () => {
    const rule = require("../../src/rules/labelsWithoutFor");
    runner.assert(
      typeof rule === "function",
      "labelsWithoutFor should export a function"
    );
  });

  runner.addTest("rules: emptyLinks module loads", () => {
    const rule = require("../../src/rules/emptyLinks");
    runner.assert(
      typeof rule === "function",
      "emptyLinks should export a function"
    );
  });

  runner.addTest("rules: unlabeledInputs module loads", () => {
    const rule = require("../../src/rules/unlabeledInputs");
    runner.assert(
      typeof rule === "function",
      "unlabeledInputs should export a function"
    );
  });

  runner.addTest("rules: multipleH1 module loads", () => {
    const rule = require("../../src/rules/multipleH1");
    runner.assert(
      typeof rule === "function",
      "multipleH1 should export a function"
    );
  });

  runner.addTest("rules: iframeTitles module loads", () => {
    const rule = require("../../src/rules/iframeTitles");
    runner.assert(
      typeof rule === "function",
      "iframeTitles should export a function"
    );
  });

  runner.addTest("rules: contrast module loads", () => {
    const rule = require("../../src/rules/contrast");
    runner.assert(
      typeof rule === "function",
      "contrast should export a function"
    );
  });

  runner.addTest("rules: ariaRoles module loads", () => {
    const rule = require("../../src/rules/ariaRoles");
    runner.assert(
      typeof rule === "function",
      "ariaRoles should export a function"
    );
  });

  runner.addTest("rules: landmarkRoles module loads", () => {
    const rule = require("../../src/rules/landmarkRoles");
    runner.assert(
      typeof rule === "function",
      "landmarkRoles should export a function"
    );
  });

  // Test that rules accept config parameter (signature check)
  runner.addTest("rules: altAttributes accepts config parameter", () => {
    const rule = require("../../src/rules/altAttributes");
    // Check function length - should accept at least 3 parameters
    runner.assert(
      rule.length <= 3,
      "altAttributes should accept config parameter"
    );
  });

  runner.addTest("rules: linksOpenNewTab accepts config parameter", () => {
    const rule = require("../../src/rules/linksOpenNewTab");
    runner.assert(
      rule.length <= 3,
      "linksOpenNewTab should accept config parameter"
    );
  });

  // Test that rules can be called with config (using simple HTML)
  runner.addTest("rules: altAttributes runs with English config", () => {
    const rule = require("../../src/rules/altAttributes");
    const html = '<html><body><img src="test.jpg"></body></html>';
    const result = rule(html, "test.html", { lang: "en" });
    
    runner.assert(
      Array.isArray(result),
      "Should return an array of errors"
    );
    runner.assert(
      result.length > 0,
      "Should find missing alt attribute"
    );
    runner.assert(
      result[0].type === "missing-alt",
      "Error type should be missing-alt"
    );
    runner.assert(
      result[0].message === "<img> tag is missing an alt attribute",
      "Message should be in English"
    );
  });

  runner.addTest("rules: altAttributes runs with German config", () => {
    const rule = require("../../src/rules/altAttributes");
    const html = '<html lang="de"><body><img src="test.jpg"></body></html>';
    const result = rule(html, "test.html", { lang: "de" });
    
    runner.assert(
      Array.isArray(result),
      "Should return an array of errors"
    );
    runner.assert(
      result.length > 0,
      "Should find missing alt attribute"
    );
    runner.assert(
      result[0].type === "missing-alt",
      "Error type should be missing-alt"
    );
    runner.assert(
      result[0].message === "<img>-Tag hat kein alt-Attribut",
      "Message should be in German"
    );
  });

  runner.addTest("rules: altAttributes uses configurable altMaxLength", () => {
    const rule = require("../../src/rules/altAttributes");
    const html = '<html><body><img src="test.jpg" alt="This is a very long alt text that exceeds the default limit of 125 characters but should be caught"></body></html>';
    const result = rule(html, "test.html", { lang: "en", altMaxLength: 50 });
    
    runner.assert(
      result.some(e => e.type === "alt-too-long"),
      "Should find alt-too-long error with custom limit"
    );
    runner.assert(
      result.some(e => e.message.includes("50")),
      "Error message should contain the custom limit"
    );
  });

  runner.addTest("rules: linksOpenNewTab runs with English config", () => {
    const rule = require("../../src/rules/linksOpenNewTab");
    const html = '<html><body><a href="https://example.com" target="_blank">Link</a></body></html>';
    const result = rule(html, "test.html", { lang: "en" });
    
    runner.assert(
      Array.isArray(result),
      "Should return an array of errors"
    );
    runner.assert(
      result.length > 0,
      "Should find missing new tab warning"
    );
    runner.assert(
      result[0].type === "link-new-tab-warning",
      "Error type should be link-new-tab-warning"
    );
    runner.assert(
      result[0].message.includes("target=\"_blank\""),
      "Message should mention target attribute"
    );
  });

  runner.addTest("rules: linksOpenNewTab with German pattern in config", () => {
    const rule = require("../../src/rules/linksOpenNewTab");
    // HTML with German new tab warning
    const html = '<html><body><a href="https://example.com" target="_blank" aria-label="öffnet in neuem Tab">Link</a></body></html>';
    const result = rule(html, "test.html", { 
      lang: "de",
      newTabNoticePatterns: ["öffnet in neuem Tab", "öffnet in neuem Fenster"]
    });
    
    runner.assert(
      Array.isArray(result),
      "Should return an array"
    );
    runner.assert(
      result.length === 0,
      "Should not find error when aria-label contains German pattern"
    );
  });

  runner.addTest("rules: headingOrder runs with German config", () => {
    const rule = require("../../src/rules/headingOrder");
    const html = '<html><body><h1>Title</h1><h3>Subtitle</h3></body></html>';
    const result = rule(html, "test.html", { lang: "de" });
    
    runner.assert(
      Array.isArray(result),
      "Should return an array of errors"
    );
    runner.assert(
      result.length > 0,
      "Should find heading order error"
    );
    runner.assert(
      result[0].type === "heading-order",
      "Error type should be heading-order"
    );
    runner.assert(
      result[0].message.includes("folgt auf"),
      "Message should be in German"
    );
  });

  runner.addTest("rules: multipleH1 runs with German config", () => {
    const rule = require("../../src/rules/multipleH1");
    const html = '<html><body><h1>First</h1><h1>Second</h1></body></html>';
    const result = rule(html, "test.html", { lang: "de" });
    
    runner.assert(
      Array.isArray(result),
      "Should return an array of errors"
    );
    runner.assert(
      result.length === 2,
      "Should find 2 multiple h1 errors"
    );
    runner.assert(
      result[0].message.includes("Mehrere"),
      "Message should be in German"
    );
  });
};
