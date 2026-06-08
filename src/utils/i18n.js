/**
 * Internationalization (i18n) messages for accessibility error reporting.
 * Supports English (en) and German (de).
 * 
 * @type {Object.<string, Object.<string, string>>}
 */
const messages = {
  en: {
    // Alt attributes
    "missing-alt": "<img> tag is missing an alt attribute",
    "alt-empty": "alt attribute exists but is empty; ensure this is intentional (e.g., decorative image)",
    "alt-too-long": "alt attribute exceeds {maxLength} characters ({length} characters)",
    "alt-decorative-incorrect": "Decorative image should have empty alt=\"\" or role=\"presentation\"",
    "alt-functional-empty": "Functional image inside <a> or <button> needs descriptive alt text",
    "redundant-title": "<img> has a 'title' attribute that duplicates its 'alt' text: \"{alt}\"",
    
    // ARIA
    "aria-invalid": "aria-label is empty",
    "aria-invalid-ref": "aria-labelledby references a non-existent ID: {id}",
    "aria-role-invalid": "Unrecognized or inappropriate ARIA role: \"{role}\"",
    "missing-aria": "<{tag}> element should have an aria-label or visible text",
    
    // Headings
    "heading-order": "<{tag}> follows <h{lastLevel}>",
    "heading-empty": "<{tag}> element is empty or contains only whitespace",
    "multiple-h1": "Multiple <h1> tags found ({count} total)",
    
    // Forms
    "label-missing-for": "<label> is not associated with any form control (missing 'for' or nested input)",
    "label-for-missing": '<label for="{forAttr}"> does not match any element with that ID',
    "input-unlabeled": '<input type="{type}"> is not associated with a label',
    
    // Links
    "empty-link": "<a> tag is empty or has no href/text",
    "link-new-tab-warning": "<a> with target=\"_blank\" should inform users it opens in a new tab (e.g., via aria-label or screen reader note)",
    
    // Other
    "iframe-title-missing": "<iframe> is missing a non-empty 'title' attribute to describe its content",
    "missing-landmark": "No landmark elements (main, nav, header, footer, aside) found",
    "contrast": "Low contrast ratio ({ratio}): {color} on {background}",
  },
  de: {
    // Alt attributes
    "missing-alt": "<img>-Tag hat kein alt-Attribut",
    "alt-empty": "alt-Attribut ist leer; stellen Sie sicher, dass dies beabsichtigt ist (z. B. bei dekorativen Bildern)",
    "alt-too-long": "alt-Attribut überschreitet {maxLength} Zeichen ({length} Zeichen)",
    "alt-decorative-incorrect": "Dekoratives Bild sollte leeres alt=\"\" oder role=\"presentation\" haben",
    "alt-functional-empty": "Funktionelles Bild innerhalb von <a> oder <button> benötigt beschreibenden Alternativtext",
    "redundant-title": "<img> hat ein 'title'-Attribut, das den 'alt'-Text dupliziert: \"{alt}\"",
    
    // ARIA
    "aria-invalid": "aria-label darf nicht leer sein",
    "aria-invalid-ref": "aria-labelledby referenziert eine nicht vorhandene ID: {id}",
    "aria-role-invalid": "Nicht anerkannte oder unangemessene ARIA-Rolle: \"{role}\"",
    "missing-aria": "<{tag}>-Element sollte ein aria-label oder sichtbaren Text haben",
    
    // Headings
    "heading-order": "<{tag}> folgt auf <h{lastLevel}>",
    "heading-empty": "<{tag}>-Element ist leer oder enthält nur Leerzeichen",
    "multiple-h1": "Mehrere <h1>-Tags gefunden ({count} insgesamt)",
    
    // Forms
    "label-missing-for": "<label> ist nicht mit einem Formularelement verknüpft (fehlendes 'for'-Attribut oder verschachteltes Input)",
    "label-for-missing": '<label for="{forAttr}"> findet kein Element mit dieser ID',
    "input-unlabeled": '<input type="{type}"> ist nicht mit einem Label verknüpft',
    
    // Links
    "empty-link": "<a>-Tag ist leer oder hat keinen href/Text",
    "link-new-tab-warning": "<a> mit target=\"_blank\" sollte Nutzer darüber informieren, dass es in einem neuen Tab geöffnet wird (z. B. über aria-label oder Screenreader-Hinweis)",
    
    // Other
    "iframe-title-missing": "<iframe> hat kein nicht-leeres 'title'-Attribut zur Beschreibung des Inhalts",
    "missing-landmark": "Keine Landmark-Elemente (main, nav, header, footer, aside) gefunden",
    "contrast": "Niedriges Kontrastverhältnis ({ratio}): {color} auf {background}",
  },
};

/**
 * Returns the default language to use
 * @constant {string}
 */
const DEFAULT_LANG = "en";

/**
 * Get a localized message by key and language.
 * Falls back to English if the language or key is not found.
 * 
 * @param {string} key - Message key (e.g., "missing-alt")
 * @param {string} lang - Language code (e.g., "de", "en")
 * @param {Object} [vars] - Variables to replace in the message (e.g., {length: 50})
 * @returns {string} Localized message with variables replaced
 */
function getMessage(key, lang = DEFAULT_LANG, vars = {}) {
  const langMessages = messages[lang] || messages[DEFAULT_LANG];
  let message = langMessages[key] || messages[DEFAULT_LANG][key] || key;

  // Replace variables like {length}, {maxLength}, etc.
  for (const [varName, value] of Object.entries(vars)) {
    message = message.replace(new RegExp("{" + varName + "}", "g"), value);
  }

  return message;
}

/**
 * Get all message keys for a given language.
 * Useful for validation and testing.
 * 
 * @param {string} [lang] - Language code
 * @returns {string[]} Array of message keys
 */
function getMessageKeys(lang = DEFAULT_LANG) {
  return Object.keys(messages[lang] || messages[DEFAULT_LANG]);
}

/**
 * Get supported languages.
 * 
 * @returns {string[]} Array of supported language codes
 */
function getSupportedLanguages() {
  return Object.keys(messages);
}

module.exports = {
  getMessage,
  getMessageKeys,
  getSupportedLanguages,
  DEFAULT_LANG,
  messages,
};
