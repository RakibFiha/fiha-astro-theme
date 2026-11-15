# fiha-astro-theme

Shared layout pieces for small bilingual (English/Japanese) personal sites built with [Astro](https://astro.build), each with a printable CV. Sites include this repo as a **git submodule** at `theme/`, and keep their own content (YAML), images and settings.

Static HTML only: no client-side framework, no web fonts, inline SVG icons.

## What's here

| Path | Purpose |
|---|---|
| `styles/site.css` | Site styles: light/dark, Japanese typography, phone layout |
| `styles/cv.css` | Printable A4 CV styles (imported with `?raw` and inlined) |
| `components/Icon.astro` | Inline SVG icons (mail, LinkedIn, GitHub, document, moon, sun) |

More (components, the content schema, build scripts) will move here step by step.

## Using it in a site

```bash
git submodule add https://github.com/RakibFiha/fiha-astro-theme.git theme
```

```astro
---
import "../../theme/styles/site.css";
import Icon from "../../theme/components/Icon.astro";
---
```

Put site-specific tweaks in a local stylesheet imported **after** the theme's, so its rules win.

- Clone sites with `git clone --recurse-submodules`, or run `git submodule update --init` after cloning.
- CI checkouts need `submodules: true` (`actions/checkout`).
- To update a site: `git -C theme pull origin main`, then commit the new `theme` pointer in a PR. Dependabot (`package-ecosystem: gitsubmodule`) can open these PRs.

## Changing the theme

1. Open a PR here. Keep it free of personal content: no names, photos, contact details or YAML content.
2. After merging, bump the `theme` pointer in each site and check its Cloudflare Pages preview.

## License

MIT
