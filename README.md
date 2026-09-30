# duz-landing

This repository contains the public landing page for www.duz.events.
**Note: This repository is completely public.**

## Previewing locally

To preview the site, run a local web server from the root of the repository:
```bash
python3 -m http.server 8000
```
Then visit `http://127.0.0.1:8000`.

## Go live

To switch the call-to-action from "coming soon" to live, set `data-launched="true"` on the `<html>` tag in `index.html` and `404.html`, then merge to `main`.

## Regenerating `og.png`

The Open Graph image (`assets/og.png`) is generated from `assets/og.html`. You can take a screenshot of it using headless Chrome or a tool like Puppeteer, and save it to `assets/og.png` at exactly 1200×630 pixels.

## Outstanding (owner)
- privacy and terms pages
- the contact address
- the domain setup in §7 of WEB-LAND-1
