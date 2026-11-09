# Bobur Tukhtamurodov — AI Engineer Portfolio

A responsive, accessible, privacy-first portfolio with English/Uzbek language switching, dark/light themes, animated interface, project category filters and keyboard-accessible project details.

## Run immediately (no installation)

Open `bobur-ai-portfolio-standalone.html` directly for the self-contained version (one file, no other files required). Alternatively, open `index.html` with `site.css` and `site.js` beside it. No internet connection or third-party services are needed for the design or interaction. External project/LinkedIn links naturally require internet access.

## Next.js deployment

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000. To create production static files:

```bash
npm run build
```

The generated `out/` directory can be deployed to Vercel, Netlify, GitHub Pages (with correct path configuration), or any static web server. `output: "export"` is configured. Next.js source is in `app/` and `lib/`; shared browser assets are in `public/`.

## Editing

- `lib/portfolioMarkup.ts` — Next.js page markup; generated from `_markup.html`.
- `_markup.html` — editable HTML source. After editing it, regenerate `lib/portfolioMarkup.ts` and `index.html`, or update them manually.
- `public/site.css` — page styles. The offline version uses a matching `site.css`, and Next.js uses a matching `app/globals.css`. Keep these three copies aligned if changing styles.
- `public/site.js` — bilingual text, project details, filters, modal, and theme logic; keep `site.js` in sync for offline mode.
- `app/layout.tsx` — Next.js SEO metadata, favicon and JavaScript loading.

## Safety and accuracy

The public LinkedIn profile was used for core professional information, and previously user-provided project information was used for high-level engineering work. The Cargo X-ray item is explicitly labelled research. No private infrastructure IP addresses, API keys, internal URLs, private code, or unverified performance metrics are included. The portfolio is a personal site, not an official Customs Committee website.

LinkedIn: https://www.linkedin.com/in/bobur-tukhtamurodov-601a45315/
Public project: https://notarif.customs.uz/notarif/
Certificate verification: https://omp.aistudy.uz/certificate?id=2cee828b-ec82-4330-4e16-08de0d45bb99

## Before publishing

Review all descriptions, optionally add an authorised professional headshot, add your confirmed GitHub and email links if desired.

Note: The Next.js dependencies could not be installed in the authoring environment due to lack of npm registry connectivity. The standalone HTML/CSS/JS version is directly testable without dependencies.
