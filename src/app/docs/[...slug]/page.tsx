import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getAllDocSlugs, getDocBySlug } from "@/lib/docs";
import { mdxComponents } from "@/components/docs/mdx-components";
import { DocsEditWrapper } from "@/components/docs/DocsEditWrapper";

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
        <p className="mb-6 text-base text-[var(--text-muted)]">{doc.frontmatter.description}</p>
      )}

      {/* Client wrapper: shows edit toolbar for admins + Firestore overrides */}
      <DocsEditWrapper slug={slug} fileContent={doc.content} />

      {/* Server-rendered file content (always present; hidden by CSS when override active) */}
      <div className="doc-body doc-file-content">
        <MDXRemote
          source={doc.content}
          components={mdxComponents}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </div>
    </article>
  );
}
