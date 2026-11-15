# fiha-astro-theme

Shared layout pieces for small bilingual (English/Japanese) personal sites built with [Astro](https://astro.build), each with a printable CV. Sites include this repo as a **git submodule** at `theme/`, and keep their own content (YAML), images and settings.

Static HTML only: no client-side framework, no web fonts, inline SVG icons.

## What's here

| Path | Purpose |
|---|---|
| `components/Home.astro` | The one-page site (English and Japanese) |
| `components/Projects.astro` | The projects page (`/projects/`, `/ja/projects/`) |
| `components/Cv.astro`, `CvJa.astro` | Printable CVs (English; Japanese 職務経歴書) |
| `components/Icon.astro` | Inline SVG icons |
| `layouts/Site.astro` | `<head>` metadata and JSON-LD, header (wordmark, projects link, language switch, theme toggle), footer |
| `lib/content.ts` | Loads `content/<lang>.yaml` from the site, validates it (zod schema) and checks English/Japanese parity |
| `styles/site.css`, `styles/cv.css` | Site styles (light/dark, Japanese typography, phone layout); A4 CV styles |
| `scripts/build-cv.sh` | Prints the CV pages to PDF with headless Chrome |
| `scripts/check-dist.sh` | Sanity-checks `dist/` after a build |

Optional fields hide their part of the page: no `linkedin`/`github` hides those buttons, `projects: []` or `research: []` hides the section, and a job without `org` is shown by title only.

## What a site provides

```
astro.config.mjs        site: "https://example.com"  (used for canonical URLs, OG tags, JSON-LD)
content/en.yaml, ja.yaml All content. ui.mark sets the header wordmark ("name.rest");
                        ui.cvPdf names the CV PDFs (for example /Jane_Doe_CV.pdf)
src/pages/              Thin routes: index, ja/index, projects, ja/projects, 404, print/cv-en, print/cv-ja
src/styles/local.css    Optional. Site-only CSS, loaded after the theme's styles
scripts/build-cv.sh     Wrapper:  cd "$(dirname "$0")/.." && exec theme/scripts/build-cv.sh
scripts/check-dist.sh   Wrapper:  cd "$(dirname "$0")/.." && exec theme/scripts/check-dist.sh
public/                 Images, favicon, _redirects, _headers, the generated CV PDFs
```

A page is a few lines:

```astro
---
import Home from "../../theme/components/Home.astro";
---
<Home lang="ja" />
```

## Using it in a site

```bash
git submodule add https://github.com/RakibFiha/fiha-astro-theme.git theme
```

- Clone sites with `git clone --recurse-submodules`, or run `git submodule update --init` after cloning.
- CI checkouts need `submodules: true` (`actions/checkout`). Cloudflare Pages fetches public submodules on its own.
- Path filters in CI should include `theme` (the submodule pointer), so a theme bump rebuilds the site and CVs.
- To update a site: `git -C theme pull origin main`, then commit the new `theme` pointer in a PR. Dependabot (`package-ecosystem: gitsubmodule`) can open these PRs.
- `yaml` and `astro` come from the site's own `node_modules`.

## Changing the theme

1. Open a PR here. Keep it free of personal content: no names, photos, contact details or YAML content.
2. Merge with a **merge commit** (not squash), so commits that a site's preview already points to stay reachable.
3. After merging, bump the `theme` pointer in each site and check its Cloudflare Pages preview.

## License

MIT
