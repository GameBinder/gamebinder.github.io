# GameBinder – Official Website

Static HTML5 / CSS3 / JavaScript site. No build step, no dependencies, no backend.

## Folder structure
```
gamebinder/
├── index.html          Main page (all sections)
├── privacy.html        Placeholder – replace with your policy
├── terms.html          Placeholder – replace with your terms
├── css/style.css       Liquid Glass design system and layout
├── js/config.js        ★ Edit this: download URL, version, contact email
├── js/main.js          Menu, scroll reveal, interactive app mockup
├── assets/img/         Optimised logo, banner, favicon, social image
├── assets/games/       ★ Put game cover art here (see README inside)
└── assets/platforms/   ★ Put official platform logos (SVG) here (see README inside)
```
The original logo and banner are used unaltered (only resized and converted to WebP).

## Preview locally
Option A: open `index.html` in any modern browser.
Option B (recommended): from this folder run `python3 -m http.server 8080` and visit http://localhost:8080

## Replace the download link
Open `js/config.js` and change `downloadUrl` to your real installer URL. Every Download button updates automatically. Update `version`, `releaseDate` and `contactEmail` in the same file.
Placeholder currently used: `https://example.com/REPLACE-WITH-GAMEBINDER-INSTALLER-URL/GameBinder-Setup.exe`

## Before publishing
1. Replace `your-domain.example` in `index.html` (canonical, og:image) with your real domain.
2. Replace the placeholder text in `privacy.html` and `terms.html`.
3. Update system requirements in the Download section of `index.html`.

## Publish
Upload the whole folder as-is to any static host:
- **Netlify:** drag the folder onto app.netlify.com/drop.
- **GitHub Pages:** push to a repo, then Settings → Pages → deploy from branch `main` / root.
- **Cloudflare Pages / Vercel:** connect the repo, no build command, output directory `/`.
- **Traditional hosting:** upload the contents to `public_html` via FTP.
Serve over HTTPS and point your domain's DNS at the host.

## Notes
- Platform names (Steam, Epic Games, etc.) are shown as text monograms, not their trademarked logos. Integrations are labelled "Planned".
- Game titles and artwork in the mockup are fictional and generated in code.
- Animations respect `prefers-reduced-motion`.

## Cover art and platform logos
- `assets/games/<name>.jpg` – game covers (2:3 portrait). All 10 library games plus `re-code-veronica.jpg` (Game Launches) are included. Corner roundness is set in `css/style.css` (`.card`, `.bp-tile`, `.details .art`, `.launch .art`).
- `assets/platforms/` – all seven platform logos are included (PNG, plus `ea-app.svg`).
- Use only artwork and logos you are permitted to use.

## Game Launches
Edit the `LAUNCHES` list near the top of the app section in `js/main.js`: name, cover key `k`, and either a date `d` (YYYY-MM-DD, gives an automatic countdown) or `d: null` with a `label` such as "Q2 2027" for unconfirmed dates.
