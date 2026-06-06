const cheerio = require("cheerio");
const getLineNumber = require("../utils/getLineNumber");
const { getMessage } = require("../utils/i18n");

/**
 * Rule to validate correct usage of ARIA roles
 * (e.g., role="button" on non-interactive tags like <div> without a tabindex and click handler is misleading).
 *
 * @param {string} content - HTML content.
 * @param {string} file - File name.
 * @param {object} config - Configuration object with lang and allowedAriaRoles properties.
 * @returns {object[]} List of ARIA role errors.
 */
module.exports = function ariaRoles(content, file, config = { lang: "en" }) {
  const $ = cheerio.load(content);
  const errors = [];
  const lang = config.lang || "en";

  $("[role]").each((_, el) => {
    const role = $(el).attr("role");
    const html = $.html(el);
    const tagIndex = content.indexOf(html);
    const lineNumber = getLineNumber(content, tagIndex);

    const defaultAllowedRoles = [
      "application",
      "article",
      "blockquote",
      "caption",
      "cell",
      "code",
      "columnheader",
      "definition",
      "deletion",
      "directory",
      "document",
      "emphasis",
      "feed",
      "figure",
      "generic",
      "group",
      "heading",
      "insertion",
      "img",
      "list",
      "listitem",
      "mark",
      "math",
      "none",
      "note",
      "presentation",
      "paragraph",
      "row",
      "rowgroup",
      "rowheader",
      "separator",
      "strong",
      "subscript",
      "superscript",
      "table",
      "term",
      "time",
      "toolbar",
      "tooltip",
    ];

    const allowedRoles = config.allowedAriaRoles || defaultAllowedRoles;

    if (!allowedRoles.includes(role)) {
      errors.push({
        file,
        line: lineNumber,
        type: "aria-role-invalid",
        message: getMessage("aria-role-invalid", lang, { role }),
      });
    }
  });

  return errors;
}
