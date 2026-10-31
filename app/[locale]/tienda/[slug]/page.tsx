import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { FollowAction, FollowerStat, FollowScope } from "@/components/profile/FollowScope";
import ProfileCatalog from "@/components/profile/ProfileCatalog";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { topBrands } from "@/lib/topBrands";
import { ProfileStat } from "@/components/profile/ProfileStat";
import ShareButton from "@/components/profile/ShareButton";
import { InstagramIcon } from "@/components/ui/icons";
import { iconButtonClass } from "@/components/ui/styles";
import { getProductsByStoreId, getSoldProductsByStoreId } from "@/lib/products";
import { getStoreBySlug } from "@/lib/stores";
import { brand } from "@/lib/brand";

interface PageProps {
  params: {
    slug: string;
    locale: string;
  };
  searchParams: { tab?: string };
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

// A store's profile: the same header as a person's (ProfileHeader), with its
// pieces for sale and the ones already sold.
export default async function StorePage({ params, searchParams }: PageProps) {
  const store = await getStoreBySlug(params.slug);

  if (!store) {
    notFound();
  }

  const { locale } = params;
  const showSold = searchParams.tab === "vendidas";

  const [onSale, sold, t, tProfile] = await Promise.all([
    getProductsByStoreId(store.id),
    getSoldProductsByStoreId(store.id),
    getTranslations("ui.store"),
    getTranslations("ui.profile"),
  ]);

  const base = `/${locale}/tienda/${store.slug}`;
  const joined = store.created_at
    ? new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", { month: "long", year: "numeric" }).format(
        new Date(store.created_at)
      )
    : null;

  const tabs = [
    { href: base, label: t("on_sale"), count: onSale.length, active: !showSold },
    ...(sold.length > 0 || showSold
      ? [{ href: `${base}?tab=vendidas`, label: t("sold"), count: sold.length, active: showSold }]
      : []),
  ];

  return (
    <div className="mx-auto w-full max-w-[1280px] bg-paper pb-10">
      <FollowScope kind="store" id={store.id}>
        <ProfileHeader
          name={store.name}
          avatarSrc={store.logo_url}
          avatarTone="ink"
          coverSrc={store.cover_url}
          tools={
            <>
              {store.instagram && (
                <a
                  href={instagramHref(store.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("instagram")}
                  className={iconButtonClass}
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
              )}
              <ShareButton title={store.name} label={t("share")} copiedLabel={t("link_copied")} />
            </>
          }
          sub={`@${store.slug}`}
          stats={
            <>
              <FollowerStat />
              {sold.length > 0 && <ProfileStat label={t("stat_sold")} value={sold.length} />}
              <ProfileStat label={t("stat_on_sale")} value={onSale.length} />
            </>
          }
          action={<FollowAction name={store.name} />}
          meta={joined ? tProfile("joined", { date: joined }) : null}
          bio={store.bio}
          brandsLabel={t("brands")}
          brands={topBrands(onSale.map((product) => product.brand?.name)).map((name) => ({
            name,
            href: `${base}?brand=${encodeURIComponent(name)}`,
          }))}
          tabsLabel={t("tabs_label")}
          tabs={tabs}
        />
      </FollowScope>

      <section className="pt-3 md:px-8">
        <ProfileCatalog
          key={showSold ? "sold" : "on_sale"}
          products={showSold ? sold : onSale}
          emptyTitle={showSold ? t("empty_sold") : t("empty")}
        />
      </section>
    </div>
  );
}
