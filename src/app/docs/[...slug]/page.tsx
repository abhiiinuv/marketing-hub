import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllDocSlugs, getDocBySlug } from "@/lib/docs";
import { mdxComponents } from "@/components/docs/mdx-components";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateStaticParams() {
  const slugs = getAllDocSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) return {};
  return {
    title: `${doc.frontmatter.title} — Traycer Docs`,
    description: doc.frontmatter.description,
  };
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) notFound();

  return (
    <article className="prose-docs mx-auto max-w-3xl">
      <h1 className="mb-2 font-serif text-3xl font-normal text-white md:text-4xl">
        {doc.frontmatter.title}
      </h1>
      {doc.frontmatter.description && (
        <p className="mb-8 text-base text-[var(--text-muted)]">{doc.frontmatter.description}</p>
      )}
      <div className="doc-body">
        <MDXRemote source={doc.content} components={mdxComponents} />
      </div>
    </article>
  );
}
