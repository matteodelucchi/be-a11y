# be-a11y !

**be-a11y** is a Node.js-based CLI tool designed for automated evaluation and reporting of accessibility issues in HTML-based projects. It supports both local directory scanning and remote URL analysis to help developers identify common accessibility problems.

![Accessibility Checker](https://github.com/user-attachments/assets/40c82668-7894-4560-a7ed-77f892021bdd)


## ✅ Features

### 📐 Heading Structure
- Detects incorrect heading level order (e.g., `h1` → `h3` skipped)
- Flags empty headings (`<h1>`–`<h6>`) with no or whitespace-only content
- Warns if multiple `<h1>` tags are present

### 🖼️ Image Accessibility
- Verifies that `<img>` tags have appropriate `alt` attributes
  - ⬜ Flags empty `alt` attributes
  - ↔️ Detects excessively long `alt` texts (configurable)
  - 🌈 Ensures decorative images have correct `alt=""` or role attributes
  - 🔗 Highlights functional images (e.g., inside links/buttons) with empty `alt`
  - 📛 Detects redundant `title` attributes that duplicate the `alt` content
  - 🖼️ Verifies `<iframe>` elements include a descriptive, non-empty `title` attribute (assistive tech-friendly) (new!)

### ♿ ARIA & Semantics
- Validates `aria-label` and `aria-labelledby` usage
- Ensures `aria-labelledby` references valid IDs
- Flags misuse of ARIA roles (e.g., non-interactive elements with `role="button"`)
- Identifies missing landmark regions (`<main>`, `<nav>`, `<header>`, etc.)

### 👀 Accessible Naming
- Detects elements missing accessible names (like `<button>`, `<a>`, `<svg>`, form fields)
- Warns about unlabeled checkboxes and radio buttons
- 🔗 Checks that `<label>` elements are correctly associated with form controls (via `for` or nesting)

### 📭 Link & ID Hygiene
- Flags empty or placeholder `<a>` tags lacking text or `href`
- Warns about duplicate `id` attributes in the same document
- Warns when `target="_blank"` does not contains appropriate `aria-label` for a new page

### 🎨 Color Contrast
- Evaluates text/background contrast in inline styles
- Flags contrast below WCAG 2.1 AA threshold (4.5:1)

### 📂 Smart File & URL Analysis
- Recursively analyzes files with extensions: `.html`, `.php`, `.latte`, `.twig`, `.edge`, `.tsx`, `.jsx`
- Ignores common build directories (`node_modules`, `vendor`, `dist`, etc.)
- Accepts URLs and fetches remote pages for evaluation

### 🧪 CI/CD Friendly
- CLI output grouped and color-coded with file names and line numbers
- Returns non-zero exit code when issues are found
- Supports export of evaluation results to JSON

### ⚙️ Custom Configuration
- Fully configurable via `a11y.config.json`
- Enable or disable specific checks
- Fine-tune subrules (e.g., disable `alt-too-long` or `redundant-title`)

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

### Github Action:

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
  "rules": {
    "heading-order": true,
    "heading-empty": true,
    "missing-alt": true,
    "alt-empty": true,
    "alt-too-long": false,
    "alt-decorative-incorrect": true,
    "alt-functional-empty": true,
    "aria-invalid": true,
    "missing-aria": true,
    "aria-role-invalid": true,
    "missing-landmark": false,
    "contrast": true
  },
  "excludedDirs": {
    "dist": true,
    "node_modules": true
  },
  "excludedFiles": {
    "email-template.html": true,
    "legacy/header.twig": true
  }
}
```

> Configuration allows per-rule toggling. All rules are enabled by default unless explicitly disabled.

---

## Future Tools

* GitHub Action support
* Rule severity levels (`warning` vs `error`)
* CI summary report in SARIF format
* VS Code plugin integration

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's a bug fix, feature proposal, or documentation update — your input is valuable.

Please read our [Contribution Guide](./docs/CONTRIBUTING.md) to get started.

---

## TL;DR: 🏩 European Accessibility Act (EAA) Compliance Support

The European Accessibility Act (EAA), effective from **June 28, 2025**, requires certain digital products and services to comply with accessibility standards across the EU.

While this tool does not guarantee full compliance, **be-a11y** supports teams in their evaluation efforts by:

* ⚠️ Detecting common accessibility issues as outlined in standards like WCAG 2.1
* ✅ Providing actionable findings to assist with remediation workflows
* 🏰 Promoting awareness and adoption of inclusive development practices

**More on EAA:** [European Commission's official page](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/union-equality-strategy-rights-persons-disabilities-2021-2030/european-accessibility-act_en)

---

**Tool name:** `be-a11y`
**Repository:** [https://github.com/be-lenka/be-a11y](https://github.com/be-lenka/be-a11y)
