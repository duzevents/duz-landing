# DUZ_HANDOFF_V1

## Scope
Fix Round 1 for WEB-LAND-1.
Resolved merge blockers:
1. Missing Content Security Policy (CSP): Added CSP meta tag (`default-src 'self'`) to `index.html` and `404.html`.
2. Inline Scripts: Moved inline scripts to `assets/script.js` and included in both HTML files.
3. Incomplete Third-Party URL Check: Updated regex in `.github/workflows/pages.yml` to match protocol-relative URLs and ignore case.

## Files Changed
- `index.html`
- `404.html`
- `assets/script.js` (created)
- `.github/workflows/pages.yml`

## RED / GREEN Output
RED:
Validation failure before changes (hypothetical, as they were merge blockers):
```
Merge Blockers: Missing CSP, Inline scripts present, URL check bypassable
```

GREEN:
```
$ npx --yes html-validate@9 index.html 404.html
Success

$ INVALID_URLS=$(grep -hioE '(https?:)?//[^/"'"'"' >]+' index.html 404.html styles.css assets/script.js | sort | uniq | grep -viE '(https?:)?//(www\.duz\.events|app\.duz\.events|www\.w3\.org)$' || true); if [ -n "$INVALID_URLS" ]; then echo "Error: Found disallowed third-party requests:"; echo "$INVALID_URLS"; exit 1; else echo "Success"; fi
Success
```

## Gate Commands
- `npx --yes html-validate@9 index.html 404.html`

## Limitations
UNAVAILABLE — not verified on a real domain (GitHub Pages) directly.

## Candidate SHA
fd31ab52284a4d7b6ea87c2d3d19e22f3cf7b26c

## Fix Round 2
### Scope
Resolved merge blockers:
1. Supply Chain (Unpinned Actions and Dependencies): Pinned all GitHub Actions to exact commit SHAs and `html-validate` to `9.7.1` in `.github/workflows/pages.yml`.
2. Incomplete Third-Party URL Regex Bypass: Updated the regex in `.github/workflows/pages.yml` to prevent backslash evasion.

### Files Changed
- `.github/workflows/pages.yml`

### Verification
```
$ npx --yes html-validate@9.7.1 index.html 404.html
(no output, success)

$ INVALID_URLS=$(grep -hioE '["'"'"'](https?:)?[\\/]{2}[^"'"'"']+["'"'"']' index.html 404.html styles.css assets/script.js | sort | uniq | grep -viE '["'"'"'](https?:)?[\\/]{2}(www\.duz\.events|app\.duz\.events|www\.w3\.org)([\\/].*)?["'"'"']' || true); if [ -n "$INVALID_URLS" ]; then echo "Error: Found disallowed third-party requests:"; echo "$INVALID_URLS"; exit 1; else echo "Success"; fi
Success
```

## Fix Round 3
### Scope
Resolved merge blocker:
1. Third-Party URL Regex Bypass: Updated the regex in `.github/workflows/pages.yml` to extract any URL matching `https:`, `//`, or `:/` even with leading whitespace or single slashes for the protocol, preventing evasion of the domain validation check.

### Files Changed
- `.github/workflows/pages.yml`
- `spec_and_plans/handoffs/duz-landing-WEB-LAND-1-handoff.md`

### RED / GREEN Output
RED:
With prior regex `["'](https?:)?[\\/]{2}[^"']+["']`, URLs prepended with whitespace (e.g. `<script src=" https://attacker.com/script.js"></script>`) or using a single slash (e.g. `<script src="https:/attacker.com/script.js"></script>`) bypassed detection:
```
$ echo '<script src=" https://attacker.com/script.js"></script><script src="https:/attacker.com/script.js"></script>' | grep -hioE '["'"'"'](https?:)?[\\/]{2}[^"'"'"']+["'"'"']' | grep -viE '["'"'"'](https?:)?[\\/]{2}(www\.duz\.events|app\.duz\.events|www\.w3\.org)([\\/].*)?["'"'"']' || true
(empty output - bypass succeeds)
```

GREEN:
With updated regex `["'][[:space:]]*((https?:[\\/]*)|([\\/]{2})|(:[\\/]+))[^"']+["']`:
```
$ echo '<script src=" https://attacker.com/script.js"></script><script src="https:/attacker.com/script.js"></script>' | grep -hioE '["'"'"'][[:space:]]*((https?:[\\/]*)|([\\/]{2})|(:[\\/]+))[^"'"'"']+["'"'"']' | grep -viE '["'"'"'][[:space:]]*((https?:[\\/]*)|([\\/]{2})|(:[\\/]+))(www\.duz\.events|app\.duz\.events|www\.w3\.org)([\\/][^"'"'"']*)?[[:space:]]*["'"'"']' || true
" https://attacker.com/script.js"
"https:/attacker.com/script.js"
```

Repository check:
```
$ npx --yes html-validate@9.7.1 index.html 404.html
(Exit code 0, no output)

$ INVALID_URLS=$(grep -hioE '["'"'"'][[:space:]]*((https?:[\\/]*)|([\\/]{2})|(:[\\/]+))[^"'"'"']+["'"'"']' index.html 404.html styles.css assets/script.js | sort | uniq | grep -viE '["'"'"'][[:space:]]*((https?:[\\/]*)|([\\/]{2})|(:[\\/]+))(www\.duz\.events|app\.duz\.events|www\.w3\.org)([\\/][^"'"'"']*)?[[:space:]]*["'"'"']' || true); if [ -n "$INVALID_URLS" ]; then echo "Error: Found disallowed third-party requests:"; echo "$INVALID_URLS"; exit 1; else echo "Success"; fi
Success
```

## Fix Round 4
### Scope
Resolved merge blockers:
1. CSS Unquoted `url()` Bypass: In CSS, `url()` does not require quotes (e.g. `background-image: url(https://evildomain.com/image.png)` or `@import url(//evildomain.com/styles.css)`). Dropped strict quote requirements so unquoted `url()` targets are extracted and evaluated.
2. JavaScript Backtick Bypass: JS template literals (e.g. `fetch(\`https://evil.com\`)` or `fetch(\`//evil.com\`)`) bypassed quote-delimited regex. Dropped strict quote requirements to extract backtick-delimited URLs.
3. HTML Entities & Multiline Formatting: Whitespace HTML entities (e.g. `src="&#x09;https://attacker.com"`) or multiline attributes (e.g. `src="\nhttps://attacker.com"`) bypassed single-line quote patterns.
4. Alternative Protocols: Catch `javascript:` and `data:` schemes in addition to `https://`, `http://`, and protocol-relative `//`.

Updated `.github/workflows/pages.yml` extraction regex to scan broadly for `((https?:[\\/]*)|([\\/]{2})|(:[\\/]+)|javascript:|data:)` followed by URL characters up to delimiters `["'`[:space:]><();,]`. Verified that local root-relative paths (`/assets/...`, `/styles.css`), CSS selectors (`[data-launched]`), and JS comments/operators are not falsely flagged.

### Files Changed
- `.github/workflows/pages.yml`
- `spec_and_plans/handoffs/duz-landing-WEB-LAND-1-handoff.md`

### RED / GREEN Output
RED:
With prior regex requiring surrounding quotes `["']...["']`, unquoted CSS `url()`, JS template literals with backticks, HTML entity whitespace, and alternative protocols bypassed detection:
```
$ echo 'background-image: url(https://evildomain.com/image.png); @import url(//evildomain.com/styles.css);' | grep -hioE '["'"'"'][[:space:]]*((https?:[\\/]*)|([\\/]{2})|(:[\\/]+))[^"'"'"']+["'"'"']' || true
(empty output - bypass succeeds)

$ echo 'fetch(`https://evil.com`); fetch(`//evil.com`);' | grep -hioE '["'"'"'][[:space:]]*((https?:[\\/]*)|([\\/]{2})|(:[\\/]+))[^"'"'"']+["'"'"']' || true
(empty output - bypass succeeds)

$ echo '<script src="&#x09;https://attacker.com"></script>' | grep -hioE '["'"'"'][[:space:]]*((https?:[\\/]*)|([\\/]{2})|(:[\\/]+))[^"'"'"']+["'"'"']' || true
(empty output - bypass succeeds)

$ echo '<iframe src="javascript:alert(1)"> <script src="data:text/html,test"></script>' | grep -hioE '["'"'"'][[:space:]]*((https?:[\\/]*)|([\\/]{2})|(:[\\/]+))[^"'"'"']+["'"'"']' || true
(empty output - bypass succeeds)
```

GREEN:
With updated regex `((https?:[\\/]*)|([\\/]{2})|(:[\\/]+)|javascript:|data:)[^"'`[:space:]><();,]+`:
```
$ echo 'background-image: url(https://evildomain.com/image.png); @import url(//evildomain.com/styles.css);' | grep -hioE '((https?:[\\/]*)|([\\/]{2})|(:[\\/]+)|javascript:|data:)[^"'"'"'`[:space:]><();,]+' | sort | uniq | grep -viE '^((https?:[\\/]*)|([\\/]{2})|(:[\\/]+))(www\.duz\.events|app\.duz\.events|www\.w3\.org)([\\/].*)?$' || true
//evildomain.com/styles.css
https://evildomain.com/image.png

$ echo 'fetch(`https://evil.com`); fetch(`//evil.com`);' | grep -hioE '((https?:[\\/]*)|([\\/]{2})|(:[\\/]+)|javascript:|data:)[^"'"'"'`[:space:]><();,]+' | sort | uniq | grep -viE '^((https?:[\\/]*)|([\\/]{2})|(:[\\/]+))(www\.duz\.events|app\.duz\.events|www\.w3\.org)([\\/].*)?$' || true
//evil.com
https://evil.com

$ echo '<script src="&#x09;https://attacker.com"></script>' | grep -hioE '((https?:[\\/]*)|([\\/]{2})|(:[\\/]+)|javascript:|data:)[^"'"'"'`[:space:]><();,]+' | sort | uniq | grep -viE '^((https?:[\\/]*)|([\\/]{2})|(:[\\/]+))(www\.duz\.events|app\.duz\.events|www\.w3\.org)([\\/].*)?$' || true
https://attacker.com

$ echo '<iframe src="javascript:alert(1)"> <script src="data:text/html,test"></script>' | grep -hioE '((https?:[\\/]*)|([\\/]{2})|(:[\\/]+)|javascript:|data:)[^"'"'"'`[:space:]><();,]+' | sort | uniq | grep -viE '^((https?:[\\/]*)|([\\/]{2})|(:[\\/]+))(www\.duz\.events|app\.duz\.events|www\.w3\.org)([\\/].*)?$' || true
data:text/html
javascript:alert
```

Repository check:
```
$ npx --yes html-validate@9.7.1 index.html 404.html
(Exit code 0, no output)

$ INVALID_URLS=$(grep -hioE '((https?:[\\/]*)|([\\/]{2})|(:[\\/]+)|javascript:|data:)[^"'"'"'`[:space:]><();,]+' index.html 404.html styles.css assets/script.js | sort | uniq | grep -viE '^((https?:[\\/]*)|([\\/]{2})|(:[\\/]+))(www\.duz\.events|app\.duz\.events|www\.w3\.org)([\\/].*)?$' || true); if [ -n "$INVALID_URLS" ]; then echo "Error: Found disallowed third-party requests:"; echo "$INVALID_URLS"; exit 1; else echo "Success"; fi
Success
```

### Limitations
- Runtime dynamic string concatenation in JavaScript (e.g. `const u = "https" + ":" + "/" + "/evil.com"; fetch(u);`) cannot be statically detected by regex grep; however, runtime browser exfiltration is blocked by the Content Security Policy meta tag (`default-src 'self'`).
- UNAVAILABLE — not verified on a real domain (GitHub Pages) directly.


## Fix Round 5
### Scope
Resolved merge blocker:
1. Public Site Exfiltration: The deploy action was staging the whole repository into `_site/` (including `spec_and_plans/`, `docs/`, and handoffs) making them public. Updated the `Stage files` step in `.github/workflows/pages.yml` to explicitly copy only allowed static assets (`*.html`, `styles.css`, `CNAME`, `robots.txt`, `sitemap.xml`, and the `assets/` directory) rather than copying everything.

### Files Changed
- `.github/workflows/pages.yml`
- `spec_and_plans/handoffs/duz-landing-WEB-LAND-1-handoff.md`

### RED / GREEN Output
RED:
With prior staging logic:
```
$ mkdir -p _site; cp -r * _site/ 2>/dev/null || true; rm -rf _site/.github _site/README.md _site/assets/og.html
$ ls -d _site/spec_and_plans
_site/spec_and_plans
```

GREEN:
With updated staging logic explicitly copying allowed files:
```
$ mkdir -p _site; cp *.html styles.css CNAME robots.txt sitemap.xml _site/ 2>/dev/null || true; cp -r assets _site/ 2>/dev/null || true
$ ls -d _site/spec_and_plans
ls: _site/spec_and_plans: No such file or directory
```

### Limitations
- UNAVAILABLE — not verified on a real domain (GitHub Pages) directly.
