const cheerio = require("cheerio");
const getLineNumber = require("../utils/getLineNumber");
const { getMessage } = require("../utils/i18n");

/**
 * Checks for invalid or missing values in `aria-label` and `aria-labelledby`.
 * Ensures `aria-labelledby` points to existing IDs.
 *
 * @param {string} content - HTML content.
 * @param {string} file - File name.
 * @param {object} config - Configuration object with lang property.
 * @returns {object[]} List of ARIA label errors.
 */
module.exports = function ariaLabels(content, file, config = { lang: "en" }) {
  const $ = cheerio.load(content);
  const errors = [];
  const lang = config.lang || "en";

  $("[aria-label], [aria-labelledby]").each((_, el) => {
    const html = $.html(el);
    const tagIndex = content.indexOf(html);
    const lineNumber = getLineNumber(content, tagIndex);

    if ($(el).attr("aria-label") !== undefined && $(el).attr("aria-label").trim() === "") {
      errors.push({
        file,
        line: lineNumber,
        type: "aria-invalid",
        message: getMessage("aria-invalid", lang),
      });
    }

    if ($(el).attr("aria-labelledby")) {
      const id = $(el).attr("aria-labelledby");
      if (!$(`#${id}`).length) {
        errors.push({
          file,
          line: lineNumber,
          type: "aria-invalid",
          message: getMessage("aria-invalid-ref", lang, { id }),
        });
      }
    }
  });

  return errors;
}
