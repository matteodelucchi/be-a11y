const cheerio = require("cheerio");
const getLineNumber = require("../utils/getLineNumber");
const { getMessage } = require("../utils/i18n");

/**
 * Validates that all <img> tags have appropriate `alt` attributes.
 * Checks for missing, empty, decorative, functional, or overly long alt texts.
 *
 * @param {string} content - HTML content.
 * @param {string} file - File name.
 * @param {object} config - Configuration object with lang property.
 * @returns {object[]} List of alt attribute errors.
 */
module.exports = function altAttributes(content, file, config = { rules: {}, lang: "en" }) {
  const $ = cheerio.load(content);
  const errors = [];
  const seen = new Set();
  const lang = config.lang || "en";
  const altMaxLength = config.altMaxLength || 125;

  $("img").each((_, el) => {
    const $el = $(el);
    const html = $.html(el);
    const tagIndex = content.indexOf(html);
    const lineNumber = getLineNumber(content, tagIndex);
    const locationKey = `${file}:${lineNumber}`;
    if (seen.has(locationKey)) return;
    seen.add(locationKey);

    const alt = $el.attr("alt");
    const role = $el.attr("role");
    const ariaHidden = $el.attr("aria-hidden");
    
    // Check if image is decorative:
    // - role="presentation" or role="none"
    // - aria-hidden="true"
    // - empty alt attribute (alt="")
    const isDecorative =
      role === "presentation" || 
      role === "none" || 
      ariaHidden === "true" ||
      alt === "";
    const isInLinkOrButton = $el.parents("a, button").length > 0;

    // Case 1: Missing alt attribute entirely
    if (typeof alt === "undefined") {
      errors.push({
        file,
        line: lineNumber,
        type: "missing-alt",
        message: getMessage("missing-alt", lang),
      });
      return;
    }

    // Case 2: Decorative image with non-empty alt
    if (isDecorative && alt !== "") {
      errors.push({
        file,
        line: lineNumber,
        type: "alt-decorative-incorrect",
        message: getMessage("alt-decorative-incorrect", lang),
      });
      return;
    }

    // Case 3: Functional image with empty alt
    if (isInLinkOrButton && alt.trim() === "") {
      errors.push({
        file,
        line: lineNumber,
        type: "alt-functional-empty",
        message: getMessage("alt-functional-empty", lang),
      });
      return;
    }

    // Case 4: alt exists but only contains whitespace
    if (alt.trim() === "") {
      errors.push({
        file,
        line: lineNumber,
        type: "alt-empty",
        message: getMessage("alt-empty", lang),
      });
    }

    // Case 5: alt is too long
    if (alt.length > altMaxLength) {
      errors.push({
        file,
        line: lineNumber,
        type: "alt-too-long",
        message: getMessage("alt-too-long", lang, { maxLength: altMaxLength, length: alt.length }),
      });
    }

    // Case 6: redundant title equals alt
    const title = $el.attr("title");
    if (
      alt &&
      title &&
      alt.trim().toLowerCase() === title.trim().toLowerCase()
    ) {
      if (config.rules["redundant-title"] !== false) {
        errors.push({
          file,
          line: lineNumber,
          type: "redundant-title",
          message: getMessage("redundant-title", lang, { alt: alt.trim() }),
        });
      }
    }
  });

  return errors;
}
