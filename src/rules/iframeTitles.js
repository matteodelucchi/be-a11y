const cheerio = require("cheerio");
const getLineNumber = require("../utils/getLineNumber");
const { getMessage } = require("../utils/i18n");

/**
 * Checks that <iframe> elements have a non-empty, descriptive title attribute.
 *
 * @param {string} content - HTML content.
 * @param {string} file - File name.
 * @param {object} config - Configuration object with lang property.
 * @returns {object[]} List of iframe title issues.
 */
module.exports = function iframeTitles(content, file, config = { lang: "en" }) {
  const $ = cheerio.load(content);
  const errors = [];
  const lang = config.lang || "en";
  
  $("iframe").each((_, el) => {
    const $el = $(el);
    const title = $el.attr("title");
    const html = $.html(el);
    const tagIndex = content.indexOf(html);
    const lineNumber = getLineNumber(content, tagIndex);

    if (!title || title.trim() === "") {
      errors.push({
        file,
        line: lineNumber,
        type: "iframe-title-missing",
        message: getMessage("iframe-title-missing", lang),
      });
    }
  });

  return errors;
}
