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
TBD
