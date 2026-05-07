const cheerio = require("cheerio");
const getLineNumber = require("../utils/getLineNumber");

/**
 * Checks if links opening in a new tab/window notify screen readers.
 *
 * @param {string} content - HTML content.
 * @param {string} file - File name.
 * @returns {object[]} List of new tab warning issues.
 */
module.exports = function linksOpenNewTab(content, file, config = {}) {
  const $ = cheerio.load(content);
  const errors = [];

  $("a[target='_blank']").each((_, el) => {
    const $el = $(el);
    const ariaLabel = $el.attr("aria-label") || "";
    const html = $.html(el);
    const tagIndex = content.indexOf(html);
    const lineNumber = getLineNumber(content, tagIndex);

    const newTabNoticePatterns = (config.newTabNoticePatterns || [
      "opens in a new tab",
      "opens in new window",
      "öffnet in neuem tab",
      "öffnet in neuem fenster",
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
        message: `<a> with target="_blank" should inform users it opens in a new tab (e.g., via aria-label or screen reader note)`,
      });
    }
  });

  return errors;
}
