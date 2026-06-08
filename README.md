# be-a11y

**be-a11y** is a Node.js-based CLI tool designed for automated evaluation and reporting of accessibility issues in HTML-based projects. It supports both local directory scanning and remote URL analysis to help developers identify common accessibility problems.

![Accessibility Checker](https://github.com/user-attachments/assets/40c82668-7894-4560-a7ed-77f892021bdd)


## ✅ Features

### 🌍 Internationalization (i18n)
- **Multi-language support**: English (en) and German (de) error messages
- **Automatic language detection**: Detects HTML `lang` attribute and meta tags to provide localized feedback
- **Configurable language**: Override automatic detection via configuration

### 📐 Heading Structure
- Detects incorrect heading level order (e.g., `h1` → `h3` skipped)
- Flags empty headings (`<h1>`–`<h6>`) with no or whitespace-only content
- Warns if multiple `<h1>` tags are present

### 🖼️ Image Accessibility
- Verifies that `<img>` tags have appropriate `alt` attributes
  - ⬜ Flags missing `alt` attributes
  - ⬜ Flags empty `alt` attributes
  - ↔️ Detects excessively long `alt` texts (configurable via `altMaxLength`)
  - 🌈 Ensures decorative images have correct `alt=""` or `role="presentation"`
  - 🔗 Highlights functional images (e.g., inside links/buttons) with empty `alt`
  - 📛 Detects redundant `title` attributes that duplicate the `alt` content
- 🖼️ Verifies `<iframe>` elements include a descriptive, non-empty `title` attribute

### ♿ ARIA & Semantics
- Validates `aria-label` and `aria-labelledby` usage
- Ensures `aria-labelledby` references valid IDs
- Flags empty `aria-label` attributes
- Flags misuse of ARIA roles (e.g., non-interactive elements with `role="button"`)
- Identifies missing landmark regions (`<main>`, `<nav>`, `<header>`, etc.)

### 👀 Accessible Naming
- Detects elements missing accessible names (like `<button>`, `<a>`, `<svg>`, form fields)
- Warns about unlabeled checkboxes and radio buttons
- Checks that `<label>` elements are correctly associated with form controls (via `for` or nesting)

### 🔗 Link & ID Hygiene
- Flags empty or placeholder `<a>` tags lacking text or `href`
- Warns about duplicate `id` attributes in the same document
- Warns when `target="_blank"` does not contain appropriate notice (configurable patterns)

### 🎨 Color Contrast
- Evaluates text/background contrast in inline styles
- Flags contrast below WCAG 2.1 AA threshold (4.5:1)

### 📂 Smart File & URL Analysis
- Recursively analyzes files with extensions: `.html`, `.php`, `.latte`, `.twig`, `.edge`, `.tsx`, `.jsx`
- Ignores common build directories (`node_modules`, `vendor`, `dist`, `build`, etc.)
- Accepts URLs and fetches remote pages for evaluation

### 🧪 CI/CD Friendly
- CLI output grouped and color-coded with file names and line numbers
- Returns non-zero exit code when issues are found
- Supports export of evaluation results to JSON

### ⚙️ Custom Configuration
- Fully configurable via `a11y.config.json`
- Enable or disable specific checks
- Fine-tune subrules (e.g., disable `alt-too-long` or `redundant-title`)
- Configure language detection and new tab notice patterns

---

## Usage

### Install dependencies:

```bash
git clone git@github.com:be-lenka/be-a11y.git && cd be-a11y && npm install

# or

npm i @belenkadev/be-a11y
```

### Run the script:

```bash
node index.js /path/to/html/files/

# or

node index.js https://example.com
```

### Export results to JSON (optional):

```bash
node index.js /path/to/html/files report.json

# or

node index.js https://example.com report.json
```

### GitHub Action:

```yaml
on:
  workflow_dispatch:
    inputs:
      url:
        description: 'URL or path'
        required: true
        default: '.'
      report:
        description: 'Path to report.json'
        required: false
        default: 'report.json'

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: be-a11y Accessibility Checker
        id: a11ychecker
        uses: be-lenka/be-a11y@v2.2.8
        continue-on-error: true
        with:
          url: ${{ github.event.inputs.url }}
          report: ${{ github.event.inputs.report }}

      - name: Upload accessibility report artifact
        if: steps.a11ychecker.outcome != 'success' && ${{ github.event.inputs.report != '' }}
        uses: actions/upload-artifact@v4
        with:
          name: accessibility-report
          path: ${{ github.event.inputs.report }}

      - name: Output artifact ID
        run:  echo 'Artifact ID is ${{ steps.artifact-upload-step.outputs.artifact-id }}'
```

### Example Configuration (`a11y.config.json`):

```json
{
  "language": null,
  "altMaxLength": 125,
  "rules": {
    "heading-order": true,
    "heading-empty": true,
    "multiple-h1": true,
    "alt-attributes": true,
    "redundant-title": true,
    "alt-empty": true,
    "alt-too-long": false,
    "alt-decorative-incorrect": true,
    "alt-functional-empty": true,
    "aria-invalid": true,
    "missing-aria": true,
    "aria-role-invalid": true,
    "missing-landmark": false,
    "contrast": true,
    "label-missing-for": true,
    "duplicate-id": true,
    "input-unlabeled": true,
    "empty-link": true,
    "iframe-title-missing": true,
    "link-new-tab-warning": true
  },
  "allowedExtensions": {
    ".latte": true,
    ".html": true,
    ".php": true,
    ".twig": true,
    ".edge": true,
    ".tsx": true,
    ".jsx": true
  },
  "excludedDirs": {
    "node_modules": true,
    "vendor": true,
    "dist": true,
    "build": true
  },
  "newTabNoticePatterns": [
    "opens in a new tab",
    "opens in new tab",
    "opens in new window",
    "opens in a new window"
  ],
  "allowedAriaRoles": [
    "application", "article", "button", "main", "nav", "header", "footer"
  ]
}
```

> **Note:** All rules are enabled by default unless explicitly disabled. Set `language` to `"de"` for German error messages, or `null` for auto-detection based on HTML content.

---

## 📚 Rules Reference

### Headings (3 rules)
| Rule | Description |
|------|-------------|
| `heading-order` | Detects incorrect heading hierarchy (skipped levels) |
| `heading-empty` | Flags headings with no or whitespace-only content |
| `multiple-h1` | Warns when multiple `<h1>` elements are present |

### Images (6 rules)
| Rule | Description |
|------|-------------|
| `alt-attributes` | Checks for missing alt attributes on images |
| `alt-empty` | Flags empty alt attributes |
| `alt-too-long` | Detects alt text exceeding configured maximum length |
| `alt-decorative-incorrect` | Ensures decorative images have empty alt or presentation role |
| `alt-functional-empty` | Checks functional images (in links/buttons) have descriptive alt |
| `redundant-title` | Detects title attributes duplicating alt text |

### ARIA & Semantics (4 rules)
| Rule | Description |
|------|-------------|
| `aria-invalid` | Flags empty aria-label attributes |
| `missing-aria` | Detects elements missing accessible names |
| `aria-role-invalid` | Identifies unrecognized or inappropriate ARIA roles |
| `missing-landmark` | Warns when no landmark elements are found |

### Forms (2 rules)
| Rule | Description |
|------|-------------|
| `label-missing-for` | Checks labels are properly associated with form controls |
| `input-unlabeled` | Detects input elements without associated labels |

### Links (2 rules)
| Rule | Description |
|------|-------------|
| `empty-link` | Flags empty anchor tags |
| `link-new-tab-warning` | Warns about target="_blank" without user notice |

### Other (3 rules)
| Rule | Description |
|------|-------------|
| `duplicate-id` | Detects duplicate id attributes in the document |
| `contrast` | Evaluates color contrast ratios |
| `iframe-title-missing` | Checks iframes have descriptive title attributes |

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's a bug fix, feature proposal, or documentation update — your input is valuable.

Please read our [Contribution Guide](./docs/CONTRIBUTING.md) to get started.

---

## 🏛️ Standards Compliance

### WCAG 2.1 AA
**be-a11y** covers the following WCAG 2.1 AA success criteria:
- 1.1.1 Non-text Content (alt attributes)
- 1.3.1 Info and Relationships (semantic structure)
- 1.4.3 Contrast (Minimum)
- 2.4.6 Headings and Labels
- 3.3.2 Labels or Instructions
- 4.1.2 Name, Role, Value

### European Accessibility Act (EAA)
The European Accessibility Act (EAA), **effective since June 28, 2025**, requires certain digital products and services to comply with accessibility standards across the EU.

While this tool does not guarantee full compliance, **be-a11y** supports teams in their evaluation efforts by:

* ⚠️ Detecting common accessibility issues as outlined in WCAG 2.1 AA
* ✅ Providing actionable findings with file paths and line numbers
* 📊 Generating JSON reports for CI/CD integration
* 🌍 Supporting multiple languages (English and German)
* 🏰 Promoting awareness and adoption of inclusive development practices

**More on EAA:** [European Commission's official page](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/union-equality-strategy-rights-persons-disabilities-2021-2030/european-accessibility-act_en)

---

**Tool name:** `be-a11y`  
**Version:** `2.2.0`  
**Repository:** [https://github.com/be-lenka/be-a11y](https://github.com/be-lenka/be-a11y)  
**npm:** [`@belenkadev/be-a11y`](https://www.npmjs.com/package/@belenkadev/be-a11y)  
**GitHub Action:** [`be-lenka/be-a11y`](https://github.com/marketplace/actions/be-a11y-accessibility-checker)
