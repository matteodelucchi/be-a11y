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

  // Common screen reader only class names (English and German)
  const screenReaderClasses = [
    "sr-only",
    "visually-hidden",
    "screen-reader-only",
    "screen-reader-text",
    "u-screenReaderOnly",
    "u-screenReaderText",
    "screen-reader",
    "sr-only-text",
  ];

  $("a[target='_blank']").each((_, el) => {
    const $el = $(el);
    const ariaLabel = $el.attr("aria-label") || "";
    const ariaHidden = $el.attr("aria-hidden");
    const html = $.html(el);
    const tagIndex = content.indexOf(html);
    const lineNumber = getLineNumber(content, tagIndex);

    const newTabNoticePatterns = (config.newTabNoticePatterns || [
      "opens in a new tab",
      "opens in new tab",
      "opens in new window",
      "opens in a new window",
      "öffnet in neuem Tab",
      "öffnet in neuem Fenster",
    ]).map((pattern) => pattern.toLowerCase());

    // Check if element has aria-hidden="true" - if so, it's intentionally hidden
    const isHiddenFromScreenReaders = ariaHidden === "true";

    // Check for screen reader only text with new tab notice
    const hasScreenReaderNote = $el
      .find(screenReaderClasses.map(c => `.${c}`).join(", "))
      .filter((i, n) => {
        const text = $(n).text().toLowerCase();
        return newTabNoticePatterns.some((pattern) => text.includes(pattern));
      }).length > 0;

    // Also check if the link itself has a screen reader class
    const linkHasSrClass = screenReaderClasses.some(c => $el.hasClass(c));

    // Check if the link contains text that describes new tab
    const linkText = $el.text().toLowerCase();
    const linkDescribesNewTab = newTabNoticePatterns.some((pattern) => 
      linkText.includes(pattern)
    );

    // Check aria-label
    const describesNewTab = newTabNoticePatterns.some((pattern) =>
      ariaLabel.toLowerCase().includes(pattern)
    );

    // If hidden from screen readers, don't require notification
    // (the link is intentionally hidden, so no need for new tab warning)
    if (isHiddenFromScreenReaders) {
      return;
    }

    if (!describesNewTab && !hasScreenReaderNote && !linkDescribesNewTab && !linkHasSrClass) {
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
