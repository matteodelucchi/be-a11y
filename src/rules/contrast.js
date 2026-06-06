const cheerio = require("cheerio");
const getLineNumber = require("../utils/getLineNumber");
const tinycolor = require("tinycolor2");
const { getMessage } = require("../utils/i18n");

/**
 * Evaluates inline styles for text/background color contrast ratio.
 * Flags contrast ratios below WCAG AA threshold (4.5).
 *
 * @param {string} content - HTML content.
 * @param {string} file - File name.
 * @param {object} config - Configuration object with lang property.
 * @returns {object[]} List of contrast issues.
 */
module.exports = function contrast(content, file, config = { lang: "en" }) {
  const $ = cheerio.load(content);
  const errors = [];
  const lang = config.lang || "en";

  $("*").each((_, el) => {
    const style = $(el).attr("style");
    if (
      style &&
      style.includes("color") &&
      style.includes("background-color")
    ) {
      const inlineStyles = style.split(";").reduce((acc, rule) => {
        const [key, value] = rule.split(":");
        if (key && value) acc[key.trim()] = value.trim();
        return acc;
      }, {});

      const fg = tinycolor(inlineStyles["color"]);
      const bg = tinycolor(inlineStyles["background-color"]);

      if (fg.isValid() && bg.isValid()) {
        const contrastRatio = tinycolor.readability(bg, fg);
        if (contrastRatio < 4.5) {
          const html = $.html(el);
          const tagIndex = content.indexOf(html);
          const lineNumber = getLineNumber(content, tagIndex);
          errors.push({
            file,
            line: lineNumber,
            type: "contrast",
            message: getMessage("contrast", lang, {
              ratio: contrastRatio.toFixed(2),
              color: inlineStyles["color"],
              background: inlineStyles["background-color"],
            }),
          });
        }
      }
    }
  });

  return errors;
}
