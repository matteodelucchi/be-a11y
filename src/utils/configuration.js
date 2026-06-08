const fs = require("fs");
const chalk = require("chalk");

/**
 * Default configuration values.
 * @constant {object}
 */
const DEFAULTS = {
  rules: {},
  allowedExtensions: {},
  excludedDirs: {},
  excludedFiles: {},
  language: null,
  newTabNoticePatterns: [
    "opens in a new tab",
    "opens in new tab",
    "opens in new window",
    "opens in a new window",
    "öffnet in neuem Tab",
    "öffnet in neuem Fenster",
  ],
  allowedAriaRoles: [
    "application",
    "article",
    "blockquote",
    "caption",
    "cell",
    "code",
    "columnheader",
    "definition",
    "deletion",
    "directory",
    "document",
    "emphasis",
    "feed",
    "figure",
    "generic",
    "group",
    "heading",
    "insertion",
    "img",
    "list",
    "listitem",
    "mark",
    "math",
    "none",
    "note",
    "presentation",
    "paragraph",
    "row",
    "rowgroup",
    "rowheader",
    "separator",
    "strong",
    "subscript",
    "superscript",
    "table",
    "term",
    "time",
    "toolbar",
    "tooltip",
  ],
  altMaxLength: 125,
};

/**
 * Known configuration keys for validation.
 * @constant {string[]}
 */
const KNOWN_CONFIG_KEYS = [
  "rules",
  "allowedExtensions",
  "excludedDirs",
  "excludedFiles",
  "language",
  "newTabNoticePatterns",
  "allowedAriaRoles",
  "altMaxLength",
];

/**
 * Loads and validates config with defaults for missing values.
 * Merges user config with defaults.
 *
 * @param {string} configFile - Path to config file
 * @returns {object} Normalized and validated config object
 */
module.exports = function configuration(configFile) {
  let config = {};
  
  try {
    const fileContent = fs.readFileSync(configFile, "utf-8");
    config = JSON.parse(fileContent);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.warn(chalk.yellow("⚠️  Invalid config file JSON. Using defaults."));
    }
    // File doesn't exist or is invalid - start with empty config
    config = {};
  }

  // Merge with defaults - user config takes precedence
  const mergedConfig = {
    ...DEFAULTS,
    ...config,
  };

  // Ensure all expected properties exist
  mergedConfig.rules ??= {};
  mergedConfig.allowedExtensions ??= {};
  mergedConfig.excludedDirs ??= {};
  mergedConfig.excludedFiles ??= {};
  mergedConfig.newTabNoticePatterns ??= DEFAULTS.newTabNoticePatterns;
  mergedConfig.allowedAriaRoles ??= DEFAULTS.allowedAriaRoles;
  mergedConfig.altMaxLength ??= DEFAULTS.altMaxLength;

  // Validate and warn about unknown keys
  const userKeys = Object.keys(config);
  const unknownKeys = userKeys.filter(key => !KNOWN_CONFIG_KEYS.includes(key));
  if (unknownKeys.length > 0) {
    console.warn(
      chalk.yellow(`⚠️  Unknown config keys: ${unknownKeys.join(", ")}. These will be ignored.`)
    );
  }

  // Validate language
  if (mergedConfig.language && !mergedConfig.language.match(/^[a-z]{2}(-[a-z]{2,3})?$/i)) {
    console.warn(
      chalk.yellow(`⚠️  Invalid language code: "${mergedConfig.language}". Using auto-detection.`)
    );
    mergedConfig.language = null;
  }

  // Validate altMaxLength
  if (typeof mergedConfig.altMaxLength !== "number" || mergedConfig.altMaxLength <= 0) {
    mergedConfig.altMaxLength = DEFAULTS.altMaxLength;
  }

  return mergedConfig;
};

/**
 * Get default configuration values.
 * 
 * @returns {object} Default configuration
 */
module.exports.getDefaults = function getDefaults() {
  return { ...DEFAULTS };
};

/**
 * Get known configuration keys.
 * 
 * @returns {string[]} Array of known config keys
 */
module.exports.getKnownKeys = function getKnownKeys() {
  return [...KNOWN_CONFIG_KEYS];
};
