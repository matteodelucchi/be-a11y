const cheerio = require("cheerio");
const { getMessage } = require("../utils/i18n");

/**
 * Verifies the presence of at least one semantic landmark element.
 * Expected tags include <main>, <nav>, <header>, <footer>, <aside>.
 *
 * @param {string} content - HTML content.
 * @param {string} file - File name.
 * @param {object} config - Configuration object with lang property.
 * @returns {object[]} List containing missing landmark error, if any.
 */
module.exports = function landmarkRoles(content, file, config = { lang: "en" }) {
  const $ = cheerio.load(content);
  const lang = config.lang || "en";
  const landmarks = ["main", "nav", "header", "footer", "aside"];
  const errors = [];

  const present = landmarks.filter((tag) => $(tag).length > 0);
  if (present.length === 0) {
    errors.push({
      file,
      line: 1,
      type: "missing-landmark",
      message: getMessage("missing-landmark", lang),
    });
  }

  return errors;
}
