import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { FollowActions, FollowerStat, FollowScope } from "@/components/profile/FollowScope";
import ProfileCatalog from "@/components/profile/ProfileCatalog";
import ProfileHeader, { topBrands, type ProfileCover } from "@/components/profile/ProfileHeader";
import { boldStat, ProfileStat } from "@/components/profile/ProfileStat";
import ShareButton from "@/components/profile/ShareButton";
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
  const cover: ProfileCover = store.cover_url
    ? { kind: "photo", src: store.cover_url }
    : { kind: "collage", images: onSale.map((product) => product.image).filter(Boolean) };
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
          cover={cover}
          tools={<ShareButton title={store.name} label={t("share")} copiedLabel={t("link_copied")} />}
          sub={
            <>
              @{store.slug}
              {joined && <> · {tProfile("joined", { date: joined })}</>}
            </>
          }
          stats={
            <>
              <FollowerStat />
              {sold.length > 0 && <ProfileStat>{t.rich("stat_sold", { count: sold.length, b: boldStat })}</ProfileStat>}
              <ProfileStat>{t.rich("stat_on_sale", { count: onSale.length, b: boldStat })}</ProfileStat>
            </>
          }
          bio={store.bio}
          actions={
            <FollowActions name={store.name} instagramHref={store.instagram ? instagramHref(store.instagram) : null} />
          }
          brandsLabel={t("brands")}
          brands={topBrands(onSale.map((product) => product.brand?.name)).map((name) => ({
            name,
            href: `${base}?brand=${encodeURIComponent(name)}`,
          }))}
          tabsLabel={t("tabs_label")}
          tabs={tabs}
        />
      </FollowScope>

      <section className="pt-4 md:px-8">
        <ProfileCatalog
          key={showSold ? "sold" : "on_sale"}
          products={showSold ? sold : onSale}
          emptyTitle={showSold ? t("empty_sold") : t("empty")}
        />
      </section>
    </div>
  );
}
