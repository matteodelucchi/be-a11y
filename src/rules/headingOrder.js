const cheerio = require("cheerio");
const getLineNumber = require("../utils/getLineNumber");
const { getMessage } = require("../utils/i18n");

/**
 * Checks if headings (h1-h6) are used in the correct hierarchical order.
 * Flags when heading levels skip more than one level (e.g., h1 -> h3 without h2).
 *
 * Note: This is a simplified check that doesn't account for sectioning elements
 * that reset heading hierarchy. For proper WCAG 2.1 compliance, headings should
 * follow a logical outline structure.
 *
 * @param {string} content - HTML content.
 * @param {string} file - File name.
 * @param {object} config - Configuration object with lang property.
 * @returns {object[]} List of heading order errors.
 */
module.exports = function headingOrder(content, file, config = { lang: "en" }) {
  const $ = cheerio.load(content);
  let lastLevel = 0;
  const errors = [];
  const lang = config.lang || "en";

  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const level = parseInt(el.name.substring(1));
    const html = $.html(el);
    const tagIndex = content.indexOf(html);
    const lineNumber = getLineNumber(content, tagIndex);

    // Check for heading hierarchy violations
    // A heading should not skip more than one level from the previous heading
    // e.g., h1 -> h3 is invalid (skips h2)
    // e.g., h2 -> h4 is invalid (skips h3)
    // But h1 -> h2 -> h1 is valid (new section starting)
    if (lastLevel > 0 && level > lastLevel + 1) {
      errors.push({
        file,
        line: lineNumber,
        type: "heading-order",
        message: getMessage("heading-order", lang, { tag: el.name, lastLevel }),
      });
    }

    lastLevel = level;
  });

  return errors;
}
