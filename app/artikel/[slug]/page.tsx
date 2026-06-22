import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { ARTICLES, getArticle, type Block } from "@/lib/articles";
import { ArrowUpRight } from "@/components/ui/icons";
import { formatTanggal } from "@/lib/format";
import { SITE_URL } from "@/lib/site";

export const revalidate = 43200;
export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = getArticle(params.slug);
  if (!a) return { title: "Artikel tidak ditemukan" };
  const url = `/artikel/${a.slug}`;
  return {
    title: a.title,
    description: a.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${a.title} · Dividen IDX`,
      description: a.description,
      publishedTime: a.date,
    },
    twitter: { card: "summary_large_image", title: a.title, description: a.description },
  };
}

function Renderer({ block }: { block: Block }) {
  switch (block.type) {
    case "h2":
      return <h2 className="mt-6 font-display text-lg font-semibold text-fg">{block.text}</h2>;
    case "p":
      return <p className="mt-3 text-sm leading-relaxed text-muted">{block.text}</p>;
    case "ul":
      return (
        <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-muted">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/60" aria-hidden="true" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "cta":
      return (
        <Link
          href={block.href}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-brand/40 bg-brand/5 px-3 py-1.5 text-sm font-medium text-brand-strong transition hover:bg-brand/10"
        >
          {block.label}
          <ArrowUpRight size={14} />
        </Link>
      );
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  const a = getArticle(params.slug);
  if (!a) notFound();

  const others = ARTICLES.filter((x) => x.slug !== a.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    datePublished: a.date,
    dateModified: a.date,
    inLanguage: "id-ID",
    mainEntityOfPage: `${SITE_URL}/artikel/${a.slug}`,
    author: { "@type": "Organization", name: "alfindigital", url: "https://alfindigital.com" },
    publisher: { "@type": "Organization", name: "alfindigital", url: "https://alfindigital.com" },
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        items={[
          { label: "Beranda", href: "/" },
          { label: "Artikel", href: "/artikel" },
          { label: a.title },
        ]}
      />

      <header>
        <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-fg sm:text-3xl">
          {a.title}
        </h1>
        <div className="mt-2 text-xs text-faint">
          {formatTanggal(a.date)} · {a.readMin} menit baca · Bukan saran investasi
        </div>
      </header>

      <article>
        {a.body.map((b, i) => (
          <Renderer key={i} block={b} />
        ))}
      </article>

      {others.length > 0 && (
        <section className="border-t border-line pt-4">
          <h2 className="mb-2 font-display text-base font-semibold text-fg">Artikel lain</h2>
          <ul className="space-y-1.5">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/artikel/${o.slug}`} className="text-sm text-brand hover:underline">
                  {o.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
