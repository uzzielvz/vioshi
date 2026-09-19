import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ProductGrid from "@/components/ProductGrid";
import { getProductsByStoreId } from "@/lib/products";
import { getStoreBySlug } from "@/lib/stores";
import { brand } from "@/lib/brand";

interface PageProps {
  params: {
    slug: string;
    locale: string;
  };
}

const BASE_FONT = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
} as const;

/** The seed stores a full profile URL; the header shows the @handle. */
function instagramHandle(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("@")) return trimmed;

  const withoutQuery = trimmed.split("?")[0];
  const segments = withoutQuery.split("/").filter(Boolean);
  const handle = segments[segments.length - 1];
  return handle && !handle.includes(".") ? `@${handle}` : null;
}

function instagramHref(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith("http")) return trimmed;
  return `https://www.instagram.com/${trimmed.replace(/^@/, "")}/`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug);
  if (!store) return { title: brand.name };

  const title = `${store.name} — ${brand.name}`;
  const description = store.bio?.slice(0, 160) || brand.descriptionDefault;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: brand.name,
    },
  };
}

export default async function StorePage({ params }: PageProps) {
  const store = await getStoreBySlug(params.slug);

  if (!store) {
    notFound();
  }

  const [products, t, tCollections] = await Promise.all([
    getProductsByStoreId(store.id),
    getTranslations("pages.store"),
    getTranslations("pages.collections"),
  ]);

  const handle = store.instagram ? instagramHandle(store.instagram) : null;

  return (
    <div className="px-4 md:px-8 py-8 md:py-12">
      <header className="border-b border-gray-200 pb-8 mb-8 md:mb-12">
        <div className="flex items-start gap-5">
          {store.logo_url && (
            <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 bg-[#F5F5F5]">
              <Image
                src={store.logo_url}
                alt={store.name}
                fill
                className="object-contain"
                sizes="80px"
              />
            </div>
          )}

          <div className="space-y-2">
            <h1
              className="uppercase tracking-wide"
              style={{ ...BASE_FONT, fontSize: "13px", fontWeight: 800, letterSpacing: "0.05em" }}
            >
              {store.name}
            </h1>

            {store.bio && (
              <p
                className="max-w-xl"
                style={{ ...BASE_FONT, fontSize: "11px", color: "#666", lineHeight: 1.7 }}
              >
                {store.bio}
              </p>
            )}

            {store.instagram && (
              <a
                href={instagramHref(store.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block underline hover:opacity-60 transition-opacity"
                style={{ ...BASE_FONT, fontSize: "11px" }}
              >
                {handle ?? t("instagram")}
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="flex items-center justify-between mb-8">
        <h2
          className="uppercase tracking-wide"
          style={{ ...BASE_FONT, fontSize: "11px", fontWeight: 500 }}
        >
          {t("pieces")}
        </h2>
        <p className="text-gray-500" style={{ ...BASE_FONT, fontSize: "11px" }}>
          {tCollections("product_count", { count: products.length })}
        </p>
      </div>

      {products.length === 0 ? (
        <p
          className="text-center py-16 uppercase tracking-wide"
          style={{ ...BASE_FONT, fontSize: "11px", color: "#666" }}
        >
          {t("empty")}
        </p>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
