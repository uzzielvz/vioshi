import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ProductGrid from "@/components/ProductGrid";
import StoreFollowActions from "@/components/StoreFollowActions";
import { getProductsByStoreId } from "@/lib/products";
import { getStoreBySlug } from "@/lib/stores";
import { brand } from "@/lib/brand";

interface PageProps {
  params: {
    slug: string;
    locale: string;
  };
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

  const [products, t] = await Promise.all([
    getProductsByStoreId(store.id),
    getTranslations("ui.store"),
  ]);

  const covers = products.map((product) => product.image).filter(Boolean).slice(0, 3);
  const initial = store.name.trim().charAt(0).toUpperCase();

  return (
    <div className="bg-paper">
      <div className="relative aspect-[16/7] overflow-hidden bg-carton md:aspect-[16/5]">
        {covers.length > 0 && (
          <div
            className={
              covers.length === 1
                ? "grid h-full grid-cols-1"
                : covers.length === 2
                  ? "grid h-full grid-cols-2"
                  : "grid h-full grid-cols-3"
            }
          >
            {covers.map((src, index) => (
              <div key={`${src}-${index}`} className="relative h-full">
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover mix-blend-multiply"
                  sizes="40vw"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-3.5 pb-4 md:px-8">
        <div className="relative -mt-[34px] h-[68px] w-[68px] overflow-hidden rounded-full border-[3px] border-paper bg-ink">
          {store.logo_url ? (
            <Image
              src={store.logo_url}
              alt=""
              fill
              className="object-cover"
              sizes="68px"
            />
          ) : (
            <span className="grid h-full w-full place-items-center text-[26px] font-extrabold text-paper">
              {initial}
            </span>
          )}
        </div>

        <h1 className="mt-2 text-[21px] font-bold tracking-[-0.015em] text-ink">{store.name}</h1>
        <StoreFollowActions
          storeId={store.id}
          storeName={store.name}
          pieces={products.length}
          instagramHref={store.instagram ? instagramHref(store.instagram) : null}
        >
          {store.bio && <p className="max-w-xl text-[13px] leading-relaxed text-ink">{store.bio}</p>}
        </StoreFollowActions>
      </div>

      <div className="border-b border-line px-3.5 md:px-8">
        <span className="-mb-px inline-flex h-[42px] items-center border-b-2 border-ink text-[13px] font-semibold text-ink">
          {t("on_sale")}
        </span>
      </div>

      <section className="px-0 py-4 md:px-8">
        {products.length === 0 ? (
          <p className="px-4 py-16 text-center text-[13px] text-muted">{t("empty")}</p>
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </div>
  );
}
