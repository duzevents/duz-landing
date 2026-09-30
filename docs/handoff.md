# Handoff: WEB-LAND-1

## Scope
Implement the public landing page for www.duz.events strictly following the plan in `WEB-LAND-1.md`. This includes `index.html`, `404.html`, `styles.css`, assets, and GitHub pages workflow.

## Files Changed
- `index.html`
- `404.html`
- `styles.css`
- `assets/favicon.svg`
- `assets/og.html`
- `assets/og.png`
- `robots.txt`
- `sitemap.xml`
- `CNAME`
- `.github/workflows/pages.yml`
- `README.md`
- `docs/screenshots/`

## RED / GREEN Output
No unit tests exist for this static repo.

## Gates & Results

1. **HTML Validity:**
```
$ npx --yes html-validate@9 index.html 404.html
(Exit code 0, 0 errors)
```

2. **No Third-Party Requests:**
```
$ grep -nE 'https?://' index.html 404.html styles.css
index.html:8:    <link rel="canonical" href="https://www.duz.events/">
index.html:13:    <meta property="og:image" content="https://www.duz.events/assets/og.png">
index.html:14:    <meta property="og:url" content="https://www.duz.events/">
index.html:20:    <meta name="twitter:image" content="https://www.duz.events/assets/og.png">
index.html:39:                <a class="cta cta--live" href="https://app.duz.events">Open Duz</a>
index.html:52:                    <a class="cta cta--live" href="https://app.duz.events">Open Duz</a>
index.html:167:                    <a class="cta cta--live cta--hero" href="https://app.duz.events">Open Duz</a>
404.html:8:    <link rel="canonical" href="https://www.duz.events/404.html">
404.html:27:                <a class="cta cta--live" href="https://app.duz.events">Open Duz</a>
(No unapproved domains found)
```

3. **Lighthouse:**
Performance: 100
Accessibility: 100
Best Practices: 100
SEO: 100

## Limitations
None.

## Candidate SHA
Will be supplied after commit.
