const cheerio = require("cheerio");
const getLineNumber = require("../utils/getLineNumber");
const { getMessage } = require("../utils/i18n");

/**
 * Checks that there is only one <h1> on the page.
 *
 * @param {string} content - HTML content.
 * @param {string} file - File name.
 * @param {object} config - Configuration object with lang property.
 * @returns {object[]} List of multiple H1 tag warnings.
 */
module.exports = function multipleH1(content, file, config = { lang: "en" }) {
  const $ = cheerio.load(content);
  const lang = config.lang || "en";
  const h1s = $("h1");

  if (h1s.length > 1) {
    return h1s
      .map((_, el) => {
        const html = $.html(el);
        const tagIndex = content.indexOf(html);
        const lineNumber = getLineNumber(content, tagIndex);
        return {
          file,
          line: lineNumber,
          type: "multiple-h1",
          message: getMessage("multiple-h1", lang, { count: h1s.length }),
        };
      })
      .get();
  }

  return [];
}
