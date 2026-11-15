// Loads and validates content/<lang>.yaml at build time.
// A missing or misspelled field fails the build with a clear message.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { z } from "astro/zod";

const text = z.string();
const optionalText = z.string().optional();
const list = z.array(z.string());

const cvOverride = z
  .object({
    title: optionalText,
    org: optionalText,
    when: optionalText,
    note: optionalText,
    points: list.optional(),
    stack: list.optional(),
    /** 雇用形態 (Japanese 職務経歴書 only). */
    employment: optionalText,
    /** 使用技術 (Japanese 職務経歴書 only). */
    tech: list.optional(),
  })
  .strict()
  .optional();

/** Projects page: links to a demo (recording, dashboard, write-up), shown only once it exists. */
const projectLink = z.object({ label: text, url: text }).strict();
const projectImage = z.object({ src: text, alt: text }).strict();

const schema = z
  .object({
    lang: z.enum(["en", "ja"]),
    meta: z
      .object({
        title: text,
        description: text,
        ogTitle: text,
        ogDescription: text,
        ogLocale: text,
        ogLocaleAlternate: text,
        path: text,
      })
      .strict(),
    ui: z
      .object({
        skipLink: text,
        /** Header wordmark, e.g. "name.family": the part after the first dot is accented. */
        mark: z.string().regex(/^[^.\s]+\.[^\s]+$/, "use the form name.rest"),
        homeLabel: text,
        themeToggleLabel: text,
        switchLanguage: z.object({ href: text, lang: text, label: text, title: text }).strict(),
        sections: z
          .object({
            about: text,
            experience: text,
            projects: text,
            education: text,
            research: text,
            skills: text,
            contact: text,
          })
          .strict(),
        nowBadge: text,
        emailButton: text,
        cvButton: text,
        cvPdf: text,
        portraitAlt: text,
        footerName: text,
        footerPlace: text,
        builtWith: text,
        /** Header link to the projects page. */
        projectsNav: text,
        projectsPage: z
          .object({
            title: text,
            description: text,
            heading: text,
            intro: text,
            highlights: text,
            demos: text,
            screenshots: text,
            code: text,
            noDemo: text,
            seeDemos: text,
          })
          .strict(),
      })
      .strict(),
    person: z
      .object({
        nameParts: list.min(1),
        subline: text,
        eyebrow: text,
        lede: text,
        email: z.string().email(),
        /** Optional: the hero button is hidden when left out. */
        linkedin: z.string().url().optional(),
        github: z.string().url().optional(),
        photo: text,
      })
      .strict(),
    about: list.min(1),
    experience: z.array(
      z
        .object({
          title: text,
          /** Optional, e.g. for a career break with no employer. */
          org: optionalText,
          orgUrl: z.string().url().optional(),
          now: z.boolean().optional(),
          when: text,
          note: optionalText,
          points: list.optional(),
          cv: cvOverride,
        })
        .strict(),
    ),
    projects: z.array(
      z
        .object({
          title: text,
          /** Anchor on the projects page, e.g. /projects/#internet-watchdog. */
          id: z.string().regex(/^[a-z0-9-]+$/, "use lowercase letters, digits and hyphens"),
          when: text,
          description: text,
          stack: list,
          /** Projects page only: demo links, a public repository and screenshots. */
          demos: z.array(projectLink).optional(),
          repo: z.string().url().optional(),
          images: z.array(projectImage).optional(),
          cv: cvOverride,
        })
        .strict(),
    ),
    education: z.array(
      z
        .object({
          title: text,
          org: text,
          orgUrl: z.string().url().optional(),
          when: text,
          note: optionalText,
          cv: cvOverride,
        })
        .strict(),
    ),
    research: z.array(
      z
        .object({ title: text, titleLang: optionalText, url: text, when: text, note: text })
        .strict(),
    ),
    skills: z.array(
      z
        .object({
          label: text,
          cvLabel: optionalText,
          items: text,
          cv: z.enum(["skills", "additional"]).default("skills"),
          cvOrder: z.number().optional(),
        })
        .strict(),
    ),
    contact: z.object({ links: z.array(z.object({ label: text, url: text }).strict()) }).strict(),
    jsonLd: z
      .object({
        name: text,
        givenName: text,
        familyName: text,
        alternateName: list,
        jobTitle: text,
        worksFor: z.object({ name: text, parent: optionalText }).strict(),
        homeLocation: text,
        alumniOf: list,
        sameAs: list,
      })
      .strict(),
    cv: z
      .object({
        documentTitle: text,
        docLabel: z.string(),
        heading: text,
        role: text,
        meta: list,
        summary: text,
        /** 自己PR (Japanese 職務経歴書 only). */
        selfPr: list.optional(),
        sections: z
          .object({
            summary: text,
            skills: text,
            experience: text,
            projects: text,
            education: text,
            additional: text,
            selfPr: optionalText,
          })
          .strict(),
      })
      .strict(),
  })
  .strict();

export type Lang = "en" | "ja";
export type Content = z.infer<typeof schema>;

const cache = new Map<Lang, Content>();

export function getContent(lang: Lang): Content {
  const hit = cache.get(lang);
  if (hit) return hit;
  // Builds run from the project root (locally, in CI and on Cloudflare Pages).
  const file = join(process.cwd(), "content", `${lang}.yaml`);
  const result = schema.safeParse(parse(readFileSync(file, "utf8")));
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`content/${lang}.yaml is invalid:\n${issues}`);
  }
  cache.set(lang, result.data);
  return result.data;
}

/** Both languages must list the same entries, so the pages stay translations of each other. */
export function checkParity(): void {
  const en = getContent("en");
  const ja = getContent("ja");
  const counts = (c: Content) => ({
    about: c.about.length,
    experience: c.experience.length,
    projects: c.projects.length,
    education: c.education.length,
    research: c.research.length,
    skills: c.skills.length,
    contact: c.contact.links.length,
  });
  const a = counts(en);
  const b = counts(ja);
  const diff = Object.keys(a).filter((k) => a[k as keyof typeof a] !== b[k as keyof typeof b]);
  if (diff.length) {
    throw new Error(
      `content/en.yaml and content/ja.yaml differ in: ${diff.join(", ")}. Keep both languages in sync.`,
    );
  }
  const ids = (c: Content) => c.projects.map((p) => p.id).join(",");
  if (ids(en) !== ids(ja)) {
    throw new Error(
      `Project ids differ between content/en.yaml (${ids(en)}) and content/ja.yaml (${ids(ja)}). Use the same ids in the same order.`,
    );
  }
}

/** Absolute URL for a site path. */
/** Absolute URL on this site. The base is `site` in the site's astro.config. */
export const siteUrl = (path: string) => {
  const base = import.meta.env.SITE;
  if (!base) throw new Error("Set `site` in astro.config (for example https://example.com).");
  return new URL(path, base).toString();
};
