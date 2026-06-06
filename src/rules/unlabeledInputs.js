const cheerio = require("cheerio");
const getLineNumber = require("../utils/getLineNumber");
const { getMessage } = require("../utils/i18n");

/**
 * Checks if checkboxes and radios are properly labeled.
 *
 * @param {string} content - HTML content.
 * @param {string} file - File name.
 * @param {object} config - Configuration object with lang property.
 * @returns {object[]} List of form label errors.
 */
module.exports = function unlabeledInputs(content, file, config = { lang: "en" }) {
  const $ = cheerio.load(content);
  const errors = [];
  const lang = config.lang || "en";

  $("input[type='checkbox'], input[type='radio']").each((_, el) => {
    const $el = $(el);
    const id = $el.attr("id");
    const label = id && $(
      `label[for='${id.replace(/["\']/g, "\\$")}']`
    ).length > 0;
    const wrapped = $el.parents("label").length > 0;

    if (!label && !wrapped) {
      const html = $.html(el);
      const tagIndex = content.indexOf(html);
      const lineNumber = getLineNumber(content, tagIndex);

      errors.push({
        file,
        line: lineNumber,
        type: "input-unlabeled",
        message: getMessage("input-unlabeled", lang, { type: $el.attr("type") }),
      });
    }
  });

  return errors;
}
