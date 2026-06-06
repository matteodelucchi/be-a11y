const cheerio = require("cheerio");
const getLineNumber = require("../utils/getLineNumber");
const { getMessage } = require("../utils/i18n");

/**
 * Checks that each <label> element is properly associated with a form control.
 * It should either have a 'for' attribute pointing to an existing control ID
 * OR contain an input/select/textarea element inside.
 *
 * @param {string} content - HTML content.
 * @param {string} file - File name.
 * @param {object} config - Configuration object with lang property.
 * @returns {object[]} List of label association errors.
 */
module.exports = function labelsWithoutFor(content, file, config = { lang: "en" }) {
  const $ = cheerio.load(content);
  const errors = [];
  const lang = config.lang || "en";

  $("label").each((_, el) => {
    const $label = $(el);
    const html = $.html(el);
    const tagIndex = content.indexOf(html);
    const lineNumber = getLineNumber(content, tagIndex);

    const forAttr = $label.attr("for");

    if (forAttr) {
      const inputMatch = $(`[id='${forAttr}']`);
      if (!inputMatch.length) {
        errors.push({
          file,
          line: lineNumber,
          type: "label-for-missing",
          message: getMessage("label-for-missing", lang, { forAttr }),
        });
      }
    } else {
      const hasNestedControl =
        $label.find("input, select, textarea").length > 0;
      if (!hasNestedControl) {
        errors.push({
          file,
          line: lineNumber,
          type: "label-missing-for",
          message: getMessage("label-missing-for", lang),
        });
      }
    }
  });

  return errors;
}
