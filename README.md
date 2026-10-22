# Kapil Adhithya N: AI/ML Engineer Portfolio

**Live:** https://zimbaan.github.io

A black-themed, animated, fully responsive portfolio built with React, Three.js, Motion and GSAP.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks, then builds to dist/
npm run preview    # serves the production build locally
```

Requires Node 20 or newer.

## Edit the content

Every word on the site comes from **`src/data/resume.ts`**: profile links, summary, stats, skills, experience, projects, education and awards. Change it there and every section updates. Nothing else needs touching for content changes.

- **Skills → evidence.** Each skill has a `usedIn` list (`"turing" | "iqube" | "nlsql" | "debugger"`). That powers the "Where I used it" panel in the Skills section. Leave it empty for skills not tied to a listed role or project.
- **Projects.** `repo: null` hides the Source button. `flow` is the step list shown in the case-study modal.
- **Resume PDF.** Replace `public/resume.pdf` with the latest copy.

## Things to fill in (TODO)

| Where | What |
| --- | --- |
| `src/data/resume.ts` → `projects[0].repo` | GitHub URL for the **Natural Language SQL Agent** (no public repo was found on github.com/zimbaan). The AI Code Debugger already links to `zimbaan/ai-code-debugger`. |
| `index.html` → `og:url`, `og:image`, `twitter:image`, `canonical` | Already set to `https://zimbaan.github.io`. Update them if the site moves to a custom domain. |
| Optional | Real screenshots of the two projects, if you want them alongside the demos. |

## Deploy

### GitHub Pages (current setup)
Every push to `main` builds and deploys automatically via `.github/workflows/deploy.yml` (Settings → Pages → Source: **GitHub Actions**). The repo is `zimbaan/zimbaan.github.io`, so the site is served at the root, `https://zimbaan.github.io`.

### Vercel (alternative)
1. Push this folder to a GitHub repo.
2. On vercel.com: **Add New → Project →** import the repo. Vercel detects Vite automatically (build `npm run build`, output `dist`).
3. Deploy. Then do the `og:image` TODO above with your new URL.

### GitHub Pages under a project path
1. Push this folder to a repo, e.g. `zimbaan/portfolio`.
2. Build with the repo name as the base path:
   ```bash
   BASE_PATH=/portfolio/ npm run build
   ```
3. Publish `dist/` (for example with `npx gh-pages -d dist`), then enable Pages for the `gh-pages` branch in the repo settings.
   For a `zimbaan.github.io` user site, build without `BASE_PATH`.

## Lighthouse (production build, local)

| Preset | Performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- | --- |
| Mobile | 92 | 100 | 100 | 100 |
| Desktop | 99 | 100 | 100 | 100 |

Scores vary a little between runs and will differ once hosted (CDN, compression, HTTP/2).

## What's inside

| Path | Purpose |
| --- | --- |
| `src/data/resume.ts` | All content |
| `src/components/sections/*` | Preloader, Navbar, Hero, About, Skills, Experience, Projects, Education, Contact, Footer |
| `src/components/demos/*` | Simulated demos: RAG → SQL pipeline diagram, NL→SQL terminal, code debugger |
| `src/components/ui/*` | Cursor, magnetic buttons, ⌘K command palette, toast, headings, reveal helpers |
| `src/three/*` | WebGL neural-network hero (lazy-loaded) |
| `src/hooks/*` | Smooth scroll (Lenis + GSAP), active section, media queries |

### Behaviour notes
- The hero network loads after first paint. Desktops get the WebGL version (three.js, ~244 kB gzipped, lazy-loaded). Phones and machines with 4 or fewer CPU cores get a dependency-free 2D canvas version (~2 kB) with the same look. Both cap pixel ratio at 1.5 and stop rendering when scrolled out of view.
- `index.html` contains a static first frame of the preloader, so something paints before the JavaScript has loaded.
- GSAP (used for the Experience timeline) is loaded on demand, outside the main bundle.
- With **reduced motion** turned on in the OS, the preloader, smooth scrolling, custom cursor and scroll animations are switched off, and the 3D scene renders as a still frame.
- The preloader shows once per browser session; click or press any key to skip it.
- The project demos are scripted and run entirely in the browser. They're labelled "Simulated demo" and use sample data.
