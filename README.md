# VIOGI — Second-hand Streetwear E-commerce

#### Video Demo: [https://www.youtube.com/watch?v=7ki4ZR4Khh8](https://www.youtube.com/watch?v=7ki4ZR4Khh8)

#### GitHub username: uzzielvz

#### edX username: uzzielvz

#### City and country: Toluca, Mexico

#### Date: June 7, 2026

#### Description:

VIOGI is a real, in-production e-commerce store for a second-hand streetwear business (premium thrift, inspired by brands like Stüssy) that I've been running on Instagram for over a year, with close to 1,500 followers and active monthly sales. This project was born out of a concrete need: to stop selling exclusively through Instagram DMs and instead have my own platform with a real catalog, cart, checkout with real payments, and trackable orders. This is not an isolated academic exercise — it's the actual store I use to sell my own inventory, with Stripe processing real, end-to-end validated payments.

The site runs in production at `vioshi.vercel.app`, built with **Next.js 14 (App Router)** and **TypeScript in strict mode**. I chose Next.js over alternatives like Create React App or a separate Express backend because I needed server-side rendering for SEO (essential for Google to index products), and because the App Router lets me mix Server Components (for fast catalog loading) with Client Components (for cart interactivity) without duplicating fetching logic.

**Frontend and design:** the interface uses Tailwind CSS with a minimalist black/white/gray aesthetic, uppercase typography with wide tracking — deliberately inspired by Stüssy's editorial lookbook rather than a generic Shopify-style store. The site supports two languages (Spanish/English) and two currencies (MXN/USD) via `next-intl`, with roughly 400 translation keys spread across 16 namespaces, since part of my audience is international.

**Backend:** I used Supabase (PostgreSQL + Auth + Storage) instead of Firebase or a custom backend with Prisma because I needed real relational SQL (for the product-variant-image-category relationships) with native Row Level Security, without having to stand up and maintain my own authentication server. The schema lives in `supabase/migrations/0001` through `0006` and covers products, variants, categories, orders, addresses, and pickup points.

**Payments:** checkout uses Stripe Payment Element (I evaluated and discarded MercadoPago) with a webhook listening for `payment_intent.succeeded`, which creates the order in the database and triggers a transactional email via Resend. I tested the full flow in production with real and test cards (`4242`) on May 24, 2026 — the checkout is not a mockup, it processes real payments.

**Visual search (the feature I'm most proud of):** I integrated Google's Gemini Vision API together with `pgvector` in Supabase to enable image-based product search — the user uploads a photo of a garment, the system generates a 768-dimension embedding, compares it against the catalog with a vector similarity RPC function, and returns the closest matching products. This is the most technically ambitious feature of the project and the one most directly connected to what I learned in the course about external APIs and data structures.

**Key file structure:**

- `app/[locale]/` — locale-routed pages
- `app/admin/` — admin panel with product CRUD, protected by a custom session cookie
- `app/api/visual-search/` — Route Handler orchestrating Gemini + pgvector
- `components/` — UI components (Header, CartDrawer, ProductCard, sectioned checkout)
- `store/` — Context API for cart state, persisted to localStorage
- `lib/products.ts` — data access layer, with cached `getProducts()` and `getProductBySlug()`
- `supabase/migrations/` — the full, versioned SQL schema
- `messages/` — es/en translation dictionaries

**Design decisions I debated:** I initially prototyped a floating search panel in the header, Nike/Adidas-style, but discarded it because it caused an annoying layout shift while typing — I ended up with a dedicated `/search` page that reuses the same grid and filter drawer as the collections page, prioritizing visual consistency over interaction novelty.

**Note on AI usage:** parts of this project (documented in the corresponding code comments and in `PLAN.md`) were built with the assistance of AI tools (Claude), including the UI integration of the visual search feature. I used these tools to speed up implementation, not to replace my understanding of the project — I understand and can explain every architectural decision documented above.

This project continues active development beyond CS50: Phase 3 (admin panel, visual search) is in progress, and Phases 4-5 (monitoring, multi-vendor marketplace) are the real business roadmap, not just the course's.
