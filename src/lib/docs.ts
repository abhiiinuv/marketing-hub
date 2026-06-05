import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DOCS_DIR = path.join(process.cwd(), "src/content/docs");

export type DocFrontmatter = {
  title: string;
  description: string | undefined;
  sidebarTitle: string | undefined;
};

export type DocEntry = {
  slug: string[];
  frontmatter: DocFrontmatter;
};

function getAllMdxFiles(dir: string, base: string[] = []): string[][] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const result: string[][] = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      result.push(...getAllMdxFiles(path.join(dir, entry.name), [...base, entry.name]));
    } else if (entry.name.endsWith(".mdx") || entry.name.endsWith(".md")) {
      const name = entry.name.replace(/\.mdx?$/, "");
      result.push([...base, name]);
    }
  }
  return result;
}

export function getAllDocSlugs(): string[][] {
  return getAllMdxFiles(DOCS_DIR);
}

export function getDocBySlug(slug: string[]): { content: string; frontmatter: DocFrontmatter } | null {
  const mdxPath = path.join(DOCS_DIR, ...slug) + ".mdx";
  const mdPath = path.join(DOCS_DIR, ...slug) + ".md";

  let raw: string;
  try {
    raw = fs.readFileSync(fs.existsSync(mdxPath) ? mdxPath : mdPath, "utf-8");
  } catch {
    return null;
  }

  const { data, content } = matter(raw);
  return {
    content,
    frontmatter: {
      title: data.title ?? slug[slug.length - 1],
      description: data.description,
      sidebarTitle: data.sidebarTitle,
    },
  };
}

export type NavGroup = {
  group: string;
  pages: (string | NavGroup)[];
};

export type NavItem = string | NavGroup;

function flattenNav(pages: NavItem[]): string[] {
  return pages.flatMap((p) => {
    if (typeof p === "string") return [p];
    return flattenNav(p.pages);
  });
}

export function getDocNavigation(): NavItem[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const docsJson = require("../content/docs/docs.json") as { navigation: { pages: NavItem[] } };
    return docsJson.navigation.pages;
  } catch {
    return getAllDocSlugs().map((s) => s.join("/"));
  }
}

export function getFlatDocSlugs(): string[] {
  return flattenNav(getDocNavigation());
}
