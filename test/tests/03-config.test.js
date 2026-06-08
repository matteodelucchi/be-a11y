/**
 * Test configuration system
 */

const { TestRunner } = require("../framework");
const fs = require("fs");
const path = require("path");

module.exports.register = function (runner) {
  runner.addTest("config: loads default values", () => {
    const config = require("../../src/utils/configuration");
    const defaults = config.getDefaults();
    
    runner.assert(
      defaults.rules !== undefined,
      "Should have rules default"
    );
    runner.assert(
      defaults.allowedExtensions !== undefined,
      "Should have allowedExtensions default"
    );
    runner.assert(
      defaults.excludedDirs !== undefined,
      "Should have excludedDirs default"
    );
    runner.assert(
      defaults.language === null,
      "Default language should be null (auto-detect)"
    );
    runner.assert(
      defaults.altMaxLength === 125,
      "Default altMaxLength should be 125"
    );
    runner.assert(
      Array.isArray(defaults.newTabNoticePatterns),
      "Should have newTabNoticePatterns array"
    );
  });

  runner.addTest("config: known keys are defined", () => {
    const config = require("../../src/utils/configuration");
    const keys = config.getKnownKeys();
    
    runner.assert(
      keys.includes("rules") &&
      keys.includes("language") &&
      keys.includes("altMaxLength") &&
      keys.includes("newTabNoticePatterns"),
      "Should include all known config keys"
    );
  });

  runner.addTest("config: loads from file with defaults", () => {
    const config = require("../../src/utils/configuration");
    const path = require("path");
    const loaded = config(path.join(__dirname, "../../a11y.config.json"));
    
    runner.assert(
      loaded.rules !== undefined,
      "Should load rules from config"
    );
    runner.assert(
      loaded.language === null,
      "Should have language setting from config"
    );
    runner.assert(
      loaded.altMaxLength === 125,
      "Should have altMaxLength from config"
    );
  });

  runner.addTest("config: merges user config with defaults", () => {
    const config = require("../../src/utils/configuration");
    const path = require("path");
    const loaded = config(path.join(__dirname, "../../a11y.config.json"));
    
    // The config file should have rules defined
    runner.assert(
      loaded.rules["heading-order"] === true,
      "Should preserve user config values"
    );
  });

  runner.addTest("config: handles missing file gracefully", () => {
    const config = require("../../src/utils/configuration");
    const loaded = config("/nonexistent/path/config.json");
    
    // Should return defaults when file doesn't exist
    runner.assert(
      loaded.rules !== undefined,
      "Should return defaults when file doesn't exist"
    );
    runner.assert(
      loaded.altMaxLength === 125,
      "Should have default altMaxLength"
    );
  });

  runner.addTest("config: validates language code", () => {
    // Create a temporary config with invalid language
    const tempConfigPath = path.join(__dirname, "temp_config.json");
    fs.writeFileSync(
      tempConfigPath,
      JSON.stringify({ language: "invalid-lang-code" }, null, 2),
      "utf-8"
    );
    
    // This should log a warning but still return valid config
    const config = require("../../src/utils/configuration");
    const loaded = config(tempConfigPath);
    
    // Invalid language should be set to null
    runner.assert(
      loaded.language === null,
      "Invalid language code should be set to null"
    );
    
    // Clean up
    fs.unlinkSync(tempConfigPath);
  });

  runner.addTest("config: validates altMaxLength", () => {
    const tempConfigPath = path.join(__dirname, "temp_config2.json");
    fs.writeFileSync(
      tempConfigPath,
      JSON.stringify({ altMaxLength: -10 }, null, 2),
      "utf-8"
    );
    
    const config = require("../../src/utils/configuration");
    const loaded = config(tempConfigPath);
    
    // Invalid altMaxLength should be set to default (125)
    runner.assert(
      loaded.altMaxLength === 125,
      "Invalid altMaxLength should be set to default"
    );
    
    // Clean up
    fs.unlinkSync(tempConfigPath);
  });

  runner.addTest("config: newTabNoticePatterns is defined in defaults", () => {
    const config = require("../../src/utils/configuration");
    const defaults = config.getDefaults();
    
    runner.assert(
      defaults.newTabNoticePatterns.includes("opens in a new tab"),
      "Should include English patterns"
    );
    runner.assert(
      defaults.newTabNoticePatterns.includes("öffnet in neuem Tab"),
      "Should include German patterns with correct encoding"
    );
    runner.assert(
      defaults.newTabNoticePatterns.includes("öffnet in neuem Fenster"),
      "Should include German patterns with correct encoding"
    );
  });

  runner.addTest("config: allowedAriaRoles is defined in defaults", () => {
    const config = require("../../src/utils/configuration");
    const defaults = config.getDefaults();
    
    runner.assert(
      Array.isArray(defaults.allowedAriaRoles),
      "Should have allowedAriaRoles array"
    );
    runner.assert(
      defaults.allowedAriaRoles.includes("button"),
      "Should include common ARIA roles"
    );
  });
};
