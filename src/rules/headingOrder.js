const cheerio = require("cheerio");
const getLineNumber = require("../utils/getLineNumber");
const { getMessage } = require("../utils/i18n");

/**
 * Checks if headings (h1-h6) are used in the correct hierarchical order.
 * Flags when heading levels skip more than one level (e.g., h1 -> h3 without h2).
 * Respects sectioning elements (section, article, aside, nav, main) which reset heading hierarchy.
 *
 * @param {string} content - HTML content.
 * @param {string} file - File name.
 * @param {object} config - Configuration object with lang property.
 * @returns {object[]} List of heading order errors.
 */
module.exports = function headingOrder(content, file, config = { lang: "en" }) {
  const $ = cheerio.load(content);
  const errors = [];
  const lang = config.lang || "en";

  // Sectioning elements that reset heading hierarchy
  const SECTIONING_ELEMENTS = ["section", "article", "aside", "nav", "main"];

  // Track the current heading context
  let lastLevel = 0;
  let sectionStack = []; // Stack to track nested sections

  // Get all elements in document order
  const allElements = $("*").toArray();

  for (const el of allElements) {
    const $el = $(el);
    const tagName = el.name;

    // Check if this is a sectioning element
    if (SECTIONING_ELEMENTS.includes(tagName)) {
      // Push current context to stack
      sectionStack.push(lastLevel);
      // Reset heading level for new section
      lastLevel = 0;
      continue;
    }

    // Check if heading
    if (tagName && tagName.match(/^h[1-6]$/)) {
      const level = parseInt(tagName.substring(1));
      const html = $.html(el);
      const tagIndex = content.indexOf(html);
      const lineNumber = getLineNumber(content, tagIndex);

      // Check for heading hierarchy violations
      // A heading should not skip more than one level from the previous heading
      // within the same sectioning context
      if (lastLevel > 0 && level > lastLevel + 1) {
        errors.push({
          file,
          line: lineNumber,
          type: "heading-order",
          message: getMessage("heading-order", lang, { tag: tagName, lastLevel }),
        });
      }

      lastLevel = level;
    }
  }

  return errors;
}
