const cheerio = require("cheerio");
const getLineNumber = require("../utils/getLineNumber");
const { getMessage } = require("../utils/i18n");

/**
 * Checks that there is only one <h1> on the page.
 * 
 * NOTE: This is NOT a WCAG 2.1 requirement. Multiple h1 elements are valid
 * HTML5 and can be semantically correct when used in different sections.
 * This check is more of a best practice/SEO recommendation than an accessibility
 * requirement. Consider disabling this rule if your use case allows multiple h1.
 *
 * @param {string} content - HTML content.
 * @param {string} file - File name.
 * @param {object} config - Configuration object with lang property.
 * @returns {object[]} List of multiple H1 tag warnings.
 */
module.exports = function multipleH1(content, file, config = { rules: {}, lang: "en" }) {
  const $ = cheerio.load(content);
  const lang = config.lang || "en";
  
  // Check if this rule is enabled (default is enabled for backward compatibility)
  if (config.rules && config.rules["multiple-h1"] === false) {
    return [];
  }
  
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
