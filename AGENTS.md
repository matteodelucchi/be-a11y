# be-a11y

Node.js CLI for automated WCAG 2.1 AA and EAA accessibility auditing via static HTML analysis.

---

## Architecture

```
be-a11y/
├── index.js          # CLI orchestrator
├── a11y.config.json  # Rules & config
├── action.yml        # GitHub Action
├── src/
│   ├── rules/        # 14 check modules
│   └── utils/        # config, logger, helpers
└── dist/             # ncc bundle
```

---

## Usage

```bash
# Directory scan
node index.js /path/to/html/

# URL analysis
node index.js https://example.com

# JSON export
node index.js /path/to/html report.json
```

GitHub Action:
```yaml
- uses: be-lenka/be-a11y@v2.2.8
  with:
    url: './public'
    report: 'report.json'
```

---

## Configuration

`a11y.config.json`:
```json
{
  "rules": { "heading-order": true, "alt-attributes": true, ... },
  "allowedExtensions": { ".html": true, ".php": true, ".tsx": true, ".twig": true, ".latte": true, ".edge": true, ".jsx": true },
  "excludedDirs": { "node_modules": true, "dist": true, "vendor": true, "build": true },
  "newTabNoticePatterns": ["opens in a new tab", "opens in new window"],
  "allowedAriaRoles": ["application", "article", ...]
}
```

All rules enabled by default unless `false`.

---

## Rules (14)

| Category | Rules | Purpose |
|----------|-------|---------|
| Headings | `heading-order`, `heading-empty`, `multiple-h1` | Validate hierarchy |
| Images | `alt-attributes` | Check alt: missing, empty, long, decorative, functional, redundant |
| ARIA | `aria-invalid`, `missing-aria`, `aria-role-invalid`, `missing-landmark` | ARIA validation |
| Forms | `label-missing-for`, `input-unlabeled` | Form accessibility |
| Links | `empty-link`, `link-new-tab-warning` | Link validation |
| Other | `contrast`, `iframe-title-missing` | Contrast & iframes |

---

## Technical Stack

- **Runtime**: Node.js ≥16, CommonJS
- **Parsing**: cheerio
- **Colors**: tinycolor2
- **CLI**: chalk
- **HTTP**: node-fetch v2
- **Actions**: @actions/core
- **Bundle**: @vercel/ncc

---

## Rule Development

### Template
```javascript
// src/rules/name.js
const cheerio = require("cheerio");
const getLineNumber = require("../utils/getLineNumber");

module.exports = function name(content, file, config = {}) {
  const $ = cheerio.load(content);
  const errors = [];
  $("selector").each((_, el) => {
    const line = getLineNumber(content, content.indexOf($.html(el)));
    if (problem) errors.push({ file, line, type: "name", message: "desc" });
  });
  return errors;
}
```

### Integration
1. Create `src/rules/name.js`
2. Add `require` to `index.js`
3. Add to `analyzeContent()` calls
4. Add to `a11y.config.json` rules
5. Add label in `src/utils/logger.js` typeLabels

---

## Standards

- WCAG 2.1 AA baseline (covers 1.1.1, 1.3.1, 1.4.3, 2.4.6, 3.3.2, 4.1.2)
- EAA (European Accessibility Act) aware

---

## Error Format

```javascript
{ file: "path.html", line: 42, type: "rule-name", message: "description" }
```

---

## Conventions

- 2-space indentation
- JSDoc for exports
- Use chalk, not console.log
- cheerio for all DOM ops

---

## Contact

- **Repo**: https://github.com/be-lenka/be-a11y
- **npm**: `@belenkadev/be-a11y`
- **Action**: `be-lenka/be-a11y`
- **Issues**: GitHub issues
- **Email**: dev@belenka.com

---

*Generated: 2026-06-06*
