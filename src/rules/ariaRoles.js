const cheerio = require("cheerio");
const getLineNumber = require("../utils/getLineNumber");

/**
 * Rule to validate correct usage of ARIA roles
 * (e.g., role="button" on non-interactive tags like <div> without a tabindex and click handler is misleading).
 *
 * @param {*} content
 * @param {*} file
 * @returns
 */
module.exports = function ariaRoles(content, file, config = {}) {
  const $ = cheerio.load(content);
  const errors = [];

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
        message: `Unrecognized or inappropriate ARIA role: "${role}"`,
      });
    }
  });

  return errors;
}
