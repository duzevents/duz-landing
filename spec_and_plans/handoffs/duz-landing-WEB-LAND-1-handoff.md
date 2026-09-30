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
