# DUZ_HANDOFF_V1

## Scope
Task: WEB-LAND-2 — Privacy policy and privacy-choices pages on www.duz.events
Base branch: `feat/web-land-1` (`adbf9a4`)

Implemented:
1. Converted `launch-readiness-review/content/privacy-policy.md` verbatim to `privacy-policy.html`:
   - Single readable column (max-width 720px, 17px body, 1.6 line height).
   - Same header and footer as `index.html`.
   - Semantic HTML: `<h1>`, `<h2>` (with IDs derived from heading text e.g. `11-deleting-your-account`), `<h3>`, lists (`<ul>`, `<ol>`), and a table for the supplier list.
   - Horizontal scrolling inside `<div class="table-wrapper">` for the supplier table on small screens, preventing page-level scroll.
   - Table of contents at top of policy linking to all 16 sections.
   - Preserved all `[[...]]` placeholders verbatim.
   - Preserved `<!-- PUBLISH ONLY AFTER PHASE 4 IS LIVE (task AGE-1) -->` comment above Section 14.
2. Converted `launch-readiness-review/content/consents.md` verbatim to `consents.html`:
   - Single readable column matching privacy policy layout.
   - Same header and footer as `index.html`.
   - Semantic HTML and section IDs.
   - Preserved `[[...]]` placeholders verbatim.
3. Updated footer on `index.html`, `404.html`, `privacy-policy.html`, and `consents.html`:
   - "Privacy policy" → `/privacy-policy`
   - "Your privacy choices" → `/consents`
4. Added both URLs to `sitemap.xml`:
   - `https://www.duz.events/privacy-policy`
   - `https://www.duz.events/consents`
5. Updated `.github/workflows/pages.yml`:
   - Extended HTML validation to all `*.html` files.
   - Extended third-party URL regex whitelist to include `ico.org.uk`.
   - Added `Check placeholders` step to fail if `grep -n '\[\[' *.html` finds unreplaced placeholders (deploy guard).
6. Updated `styles.css`:
   - Added styles for `.footer-links` with accessible color contrast and hover effects.
   - Added `.legal-main`, `.legal-toc`, `.table-wrapper`, and `.legal-table` styles with responsive table wrapping.

## Files Changed
- `.github/workflows/pages.yml`
- `404.html`
- `consents.html` (created)
- `index.html`
- `privacy-policy.html` (created)
- `sitemap.xml`
- `styles.css`
- `spec_and_plans/handoffs/duz-landing-WEB-LAND-2-handoff.md` (created)

## RED Output (verbatim, before implementation)
Executed against base `feat/web-land-1` (`adbf9a4`):
```
$ ls privacy-policy.html || echo "RED: privacy-policy.html not found"
ls: privacy-policy.html: No such file or directory
RED: privacy-policy.html not found

$ ls consents.html || echo "RED: consents.html not found"
ls: consents.html: No such file or directory
RED: consents.html not found

$ grep -n "privacy-policy" index.html 404.html || echo "RED: footer links to /privacy-policy not found"
RED: footer links to /privacy-policy not found

$ grep -n "consents" index.html 404.html || echo "RED: footer links to /consents not found"
RED: footer links to /consents not found

$ grep -n "Check placeholders" .github/workflows/pages.yml || echo "RED: placeholder check step not found in pages.yml"
RED: placeholder check step not found in pages.yml

$ grep -n "privacy-policy" sitemap.xml || echo "RED: privacy-policy not found in sitemap.xml"
RED: privacy-policy not found in sitemap.xml

$ grep -n "consents" sitemap.xml || echo "RED: consents not found in sitemap.xml"
RED: consents not found in sitemap.xml
```

## GREEN Output (verbatim, after implementation)
```
$ ls privacy-policy.html consents.html
consents.html		privacy-policy.html

$ grep -n "privacy-policy" index.html 404.html
index.html:205:                <a href="/privacy-policy">Privacy policy</a>
404.html:44:                <a href="/privacy-policy">Privacy policy</a>

$ grep -n "consents" index.html 404.html
index.html:206:                <a href="/consents">Your privacy choices</a>
404.html:45:                <a href="/consents">Your privacy choices</a>

$ grep -n "Check placeholders" .github/workflows/pages.yml
34:      - name: Check placeholders

$ grep -n "privacy-policy" sitemap.xml
7:    <loc>https://www.duz.events/privacy-policy</loc>

$ grep -n "consents" sitemap.xml
10:    <loc>https://www.duz.events/consents</loc>
```

## Gate Commands and Verification

### 1. HTML Validation
Command: `npx --yes html-validate@9.7.1 *.html`
Output:
```
(Exit code 0, no output)
```

### 2. Disallowed Third-Party URL Check
Command:
```bash
INVALID_URLS=$(grep -hioE '((https?:[\\/]*)|([\\/]{2})|(:[\\/]+)|javascript:|data:)[^"'"'"'`[:space:]><();,]+' *.html styles.css assets/script.js | sort | uniq | grep -viE '^((https?:[\\/]*)|([\\/]{2})|(:[\\/]+))(www\.duz\.events|app\.duz\.events|www\.w3\.org|ico\.org\.uk)([\\/].*)?$' || true)
if [ -n "$INVALID_URLS" ]; then
  echo "Error: Found disallowed third-party requests:"
  echo "$INVALID_URLS"
  exit 1
else
  echo "URL check passed (0 disallowed URLs)"
fi
```
Output:
```
URL check passed (0 disallowed URLs)
```

### 3. Placeholder Deploy Guard Check
Command:
```bash
if grep -n '\[\[' *.html; then
  echo "Expected deploy block: found unfilled placeholders in HTML files"
else
  echo "Error: expected placeholders not found!"
  exit 1
fi
```
Output:
```
consents.html:49:        <p><strong>Last updated: [[PUBLICATION DATE]]</strong></p>
privacy-policy.html:50:        <p><strong>Last updated: [[PUBLICATION DATE]]</strong></p>
privacy-policy.html:66:            <li><strong>[[LEGAL ENTITY NAME]]</strong>, trading as Duz</li>
privacy-policy.html:69:            <li>Address: [[REGISTERED ADDRESS]]</li>
privacy-policy.html:70:            <li>[[COMPANY NUMBER — delete this line if not a company]]</li>
privacy-policy.html:71:            <li>[[UK REPRESENTATIVE — required only if the controller is not established in the UK; otherwise delete this line]]</li>
privacy-policy.html:323:        <p>[[CONFIRM SUPPLIER LIST — add or remove suppliers before publishing, then delete this line]]</p>
privacy-policy.html:426:        <p>[[LEGAL ENTITY NAME]]<br>
privacy-policy.html:427:        [[REGISTERED ADDRESS]]</p>
Expected deploy block: found unfilled placeholders in HTML files
```

When placeholders are replaced with owner values:
```
Clean (all placeholders replaced) -> check passed! (Exit code 0)
```

### 4. Word-for-Word Content Diff
Word-for-word comparison of extracted HTML text vs source Markdown files:
- `consents.html` vs `launch-readiness-review/content/consents.md`: 100% word-for-word identical (227 words).
- `privacy-policy.html` vs `launch-readiness-review/content/privacy-policy.md`: 100% word-for-word identical (2611 words).
- All differences are whitespace and table of contents as permitted by the plan.

### 5. Responsive Layout & Horizontal Scroll Evidence (Playwright + Headless Chrome)
Evaluated across all pages at 360px and 1440px viewports:
```
Page: privacy-policy.html @ 360px: {"bodyScroll":360,"docScroll":360,"innerWidth":360,"tableScroll":{"scrollWidth":560,"clientWidth":318,"isScrollable":true}}
Page: privacy-policy.html @ 1440px: {"bodyScroll":1440,"docScroll":1440,"innerWidth":1440,"tableScroll":{"scrollWidth":678,"clientWidth":678,"isScrollable":false}}
Page: consents.html @ 360px: {"bodyScroll":360,"docScroll":360,"innerWidth":360,"tableScroll":null}
Page: consents.html @ 1440px: {"bodyScroll":1440,"docScroll":1440,"innerWidth":1440,"tableScroll":null}
Page: index.html @ 360px: {"bodyScroll":360,"docScroll":360,"innerWidth":360,"tableScroll":null}
Page: index.html @ 1440px: {"bodyScroll":1440,"docScroll":1440,"innerWidth":1440,"tableScroll":null}
Page: 404.html @ 360px: {"bodyScroll":360,"docScroll":360,"innerWidth":360,"tableScroll":null}
Page: 404.html @ 1440px: {"bodyScroll":1440,"docScroll":1440,"innerWidth":1440,"tableScroll":null}
```
Findings:
- No page-level horizontal scrolling at 360px (`docScroll == innerWidth == 360`).
- The supplier table scrolls horizontally *inside* its wrapper on small screens (`scrollWidth: 560 > clientWidth: 318`, `isScrollable: true`).

## Limitations
- UNAVAILABLE — not verified on live domain `https://www.duz.events/` (custom domain / DNS setup pending owner action).
- Owner fill tokens remain in place until the owner replaces them prior to production deployment.

## Candidate SHA
`d23ab54923393cd49c88ff615bdfa4c310c29282`
