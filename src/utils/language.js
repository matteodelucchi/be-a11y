const cheerio = require("cheerio");

/**
 * Default language to use when detection fails
 * @constant {string}
 */
const DEFAULT_LANGUAGE = "en";

/**
 * List of language codes that should use German messages.
 * Includes regional variants like de-DE, de-AT, de-CH.
 * @constant {string[]}
 */
const GERMAN_LANGUAGES = ["de", "de-de", "de-deu", "de-at", "de-ch", "de-li", "de-lu", "de-be"];

/**
 * Detect the language of HTML content.
 * Checks for language attributes in the HTML tag and meta tags.
 * 
 * @param {string} content - HTML content as a string
 * @returns {string} Detected language code (e.g., "de", "en")
 */
function detectLanguage(content) {
  if (!content || typeof content !== "string") {
    return DEFAULT_LANGUAGE;
  }

  try {
    const $ = cheerio.load(content);
    
    // Check <html lang="..."> attribute (most reliable)
    const htmlLang = $("html").attr("lang") || "";
    if (htmlLang) {
      const lang = htmlLang.toLowerCase().trim();
      if (GERMAN_LANGUAGES.includes(lang) || lang.startsWith("de-")) {
        return "de";
      }
      if (lang.startsWith("en")) {
        return "en";
      }
    }

    // Check <html xmlns="..." lang="..."> (alternative syntax)
    const htmlXmlnsLang = $("html").attr("xml:lang") || "";
    if (htmlXmlnsLang) {
      const lang = htmlXmlnsLang.toLowerCase().trim();
      if (GERMAN_LANGUAGES.includes(lang) || lang.startsWith("de-")) {
        return "de";
      }
      if (lang.startsWith("en")) {
        return "en";
      }
    }

    // Check meta http-equiv="content-language"
    const metaContentLanguage = $("meta[http-equiv='content-language']").attr("content") || "";
    if (metaContentLanguage) {
      const lang = metaContentLanguage.toLowerCase().trim();
      if (GERMAN_LANGUAGES.includes(lang) || lang.startsWith("de")) {
        return "de";
      }
      if (lang.startsWith("en")) {
        return "en";
      }
    }

    // Check meta name="language"
    const metaLanguage = $("meta[name='language']").attr("content") || "";
    if (metaLanguage) {
      const lang = metaLanguage.toLowerCase().trim();
      if (GERMAN_LANGUAGES.includes(lang) || lang.startsWith("de")) {
        return "de";
      }
      if (lang.startsWith("en")) {
        return "en";
      }
    }

  } catch (error) {
    // If parsing fails, return default
    console.warn(`Language detection failed: ${error.message}`);
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Get the language to use, considering both detection and explicit configuration.
 * 
 * @param {string} content - HTML content
 * @param {string} [explicitLang] - Explicitly configured language (overrides detection)
 * @returns {string} Language code to use
 */
function getLanguage(content, explicitLang) {
  if (explicitLang && GERMAN_LANGUAGES.includes(explicitLang.toLowerCase())) {
    return "de";
  }
  if (explicitLang && explicitLang.toLowerCase().startsWith("en")) {
    return "en";
  }
  return detectLanguage(content);
}

/**
 * Check if a language code represents German.
 * 
 * @param {string} langCode - Language code to check
 * @returns {boolean} True if the language is German
 */
function isGerman(langCode) {
  if (!langCode) return false;
  const lang = langCode.toLowerCase();
  return GERMAN_LANGUAGES.includes(lang) || lang.startsWith("de-");
}

/**
 * Check if a language code represents English.
 * 
 * @param {string} langCode - Language code to check
 * @returns {boolean} True if the language is English
 */
function isEnglish(langCode) {
  if (!langCode) return false;
  return langCode.toLowerCase().startsWith("en");
}

module.exports = {
  detectLanguage,
  getLanguage,
  isGerman,
  isEnglish,
  DEFAULT_LANGUAGE,
  GERMAN_LANGUAGES,
};
