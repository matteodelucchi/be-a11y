const cheerio = require("cheerio");
const getLineNumber = require("../utils/getLineNumber");
const { getMessage } = require("../utils/i18n");

/**
 * Checks if links opening in a new tab/window notify screen readers.
 *
 * @param {string} content - HTML content.
 * @param {string} file - File name.
 * @param {object} config - Configuration object with lang property.
 * @returns {object[]} List of new tab warning issues.
 */
module.exports = function linksOpenNewTab(content, file, config = { lang: "en" }) {
  const $ = cheerio.load(content);
  const errors = [];
  const lang = config.lang || "en";

  $("a[target='_blank']").each((_, el) => {
    const $el = $(el);
    const ariaLabel = $el.attr("aria-label") || "";
    const html = $.html(el);
    const tagIndex = content.indexOf(html);
    const lineNumber = getLineNumber(content, tagIndex);

    const newTabNoticePatterns = (config.newTabNoticePatterns || [
      "opens in a new tab",
      "opens in new window",
      "öffnet in neuem Tab",
      "öffnet in neuem Fenster",
    ]).map((pattern) => pattern.toLowerCase());

    const hasScreenReaderNote = $el
      .find(".sr-only, .visually-hidden")
      .filter((i, n) => {
        const text = $(n).text().toLowerCase();
        return newTabNoticePatterns.some((pattern) => text.includes(pattern));
      }).length > 0;

    const describesNewTab = newTabNoticePatterns.some((pattern) =>
      ariaLabel.toLowerCase().includes(pattern)
    );

    if (!describesNewTab && !hasScreenReaderNote) {
      errors.push({
        file,
        line: lineNumber,
        type: "link-new-tab-warning",
        message: getMessage("link-new-tab-warning", lang),
      });
    }
  });

  return errors;
}
