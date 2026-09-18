/**
 * Platform brand — single source for display name, URLs, and metadata.
 * Viogi (the thrift store) is a *store inside* the platform; do not replace
 * store-facing copy ("Vendido por Viogi", /tienda/viogi) with these values.
 *
 * Rename the platform by setting env vars in Vercel — no code rewrite.
 */

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return trimTrailingSlash(explicit);

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.startsWith('http') ? vercel : `https://${vercel}`;
    return trimTrailingSlash(host);
  }

  return 'http://localhost:3000';
}

export const brand = {
  /** Public platform name (header, titles, OG siteName). */
  name: process.env.NEXT_PUBLIC_BRAND_NAME?.trim() || 'VIOGI',

  /** Short tagline for metadata / home. */
  tagline:
    process.env.NEXT_PUBLIC_BRAND_TAGLINE?.trim() ||
    'Premium accessible streetwear',

  /** Absolute site origin — required for Open Graph image URLs. */
  siteUrl: resolveSiteUrl(),

  /** Platform or primary Instagram (footer / social). */
  instagramUrl:
    process.env.NEXT_PUBLIC_BRAND_INSTAGRAM?.trim() ||
    'https://www.instagram.com/viogi_/?hl=es',

  /** Resend / transactional from-address (server only; may be empty). */
  emailFrom: process.env.BRAND_EMAIL_FROM?.trim() || '',

  /** Public legal contact shown on /pages/legal. */
  legalEmail:
    process.env.BRAND_LEGAL_EMAIL?.trim() || 'legal@viogi.com',

  get titleDefault(): string {
    return `${this.name} - ${this.tagline}`;
  },

  get descriptionDefault(): string {
    return (
      process.env.NEXT_PUBLIC_BRAND_DESCRIPTION?.trim() ||
      `Shop premium accessible streetwear made in Mexico. ${this.name} offers high-quality casual clothing.`
    );
  },
} as const;

export type Brand = typeof brand;
