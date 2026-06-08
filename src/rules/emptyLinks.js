const cheerio = require("cheerio");
const getLineNumber = require("../utils/getLineNumber");
const { getMessage } = require("../utils/i18n");

/**
 * Checks for links that are empty or lack href/text.
 *
 * @param {string} content - HTML content.
 * @param {string} file - File name.
 * @param {object} config - Configuration object with lang property.
 * @returns {object[]} List of link errors.
 */
module.exports = function emptyLinks(content, file, config = { lang: "en" }) {
  const $ = cheerio.load(content);
  const errors = [];
  const lang = config.lang || "en";

  $("a").each((_, el) => {
    const $el = $(el);
    const href = $el.attr("href");
    const text = $el.text().trim();
    const html = $.html(el);
    const tagIndex = content.indexOf(html);
    const lineNumber = getLineNumber(content, tagIndex);
    const ariaLabel = $el.attr("aria-label");
    const ariaLabelledBy = $el.attr("aria-labelledby");

    // Check if link has meaningful content:
    // - Visible text
    // - aria-label attribute
    // - aria-labelledby attribute
    // - Image with non-empty alt text
    const hasImageWithAlt = $el.find("img[alt]:not([alt=''])").length > 0;
    const hasMeaningfulContent = text || ariaLabel || ariaLabelledBy || hasImageWithAlt;

    // Link is empty if:
    // - No href or href is just "#" (placeholder)
    // - No meaningful content (text, aria, or image with alt)
    if ((!href || href === "#") && !hasMeaningfulContent) {
      errors.push({
        file,
        line: lineNumber,
        type: "empty-link",
        message: getMessage("empty-link", lang),
      });
    }

    // Also flag links with href that have no meaningful content
    // (e.g., <a href="page.html"><img src="icon.png" alt=""></a>)
    if (href && href !== "#" && !hasMeaningfulContent) {
      errors.push({
        file,
        line: lineNumber,
        type: "empty-link",
        message: getMessage("empty-link", lang),
      });
    }
  });

  return errors;
}
