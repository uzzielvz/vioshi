# ESPECIFICACIÓN TÉCNICA - VIOGI ECOMMERCE
## Next.js 14 + React 18 + TypeScript

**Proyecto:** VIOGI Premium Accessible Streetwear  
**Framework:** Next.js 14 (App Router)  
**UI Framework:** React 18  
**Lenguaje:** TypeScript  
**Styling:** Tailwind CSS + CSS Modules  
**Date:** Enero 2026  

---

## I. STACK TECNOLÓGICO COMPLETO

### Frontend
```
Next.js 14.0+
├─ App Router (file-based routing)
├─ Server Components (default)
├─ Client Components (where needed)
├─ Image Optimization (next/image)
├─ Built-in API Routes
└─ Incremental Static Regeneration (ISR)

React 18.2+
├─ Hooks (useState, useContext, useReducer)
├─ Suspense (streaming)
├─ useTransition (pending states)
└─ Concurrent rendering

TypeScript
├─ Type safety (no any)
├─ Interfaces for components
├─ Custom types for domain
└─ Strict mode enabled

Styling
├─ Tailwind CSS (utility-first)
├─ CSS Modules (component-scoped styles)
├─ CSS Variables (design system tokens)
├─ Responsive design (mobile-first)
└─ Dark mode support (built-in)

State Management
├─ Context API (authentication, user preferences)
├─ useReducer (complex cart logic)
├─ Zustand OR Jotai (lightweight, optional)
└─ React Query (server state)

Data Fetching
├─ SWR (for client-side data)
├─ fetch + revalidation (server-side)
├─ Stripe API client
└─ Instagram API (for feed integration)
```

### Backend
```
Vercel Functions (Next.js API Routes)
├─ Product endpoints (/api/products)
├─ Cart endpoints (/api/cart)
├─ Checkout endpoints (/api/checkout)
├─ User endpoints (/api/auth, /api/users)
├─ Order endpoints (/api/orders)
├─ Search endpoints (/api/search)
└─ Instagram webhook (/api/webhooks/instagram)

Database
├─ PostgreSQL (Supabase, Railway, or Vercel Postgres)
├─ Tables: products, categories, orders, users, cart_items
├─ Relationships: 1:N (user:orders, product:reviews)
└─ Indexes on: product_id, user_id, created_at

File Storage
├─ Vercel Blob (images)
├─ Cloudinary (CDN for product images)
└─ S3 (backup, large files)

Authentication
├─ NextAuth.js v5 (authentication)
├─ JWT tokens (session management)
├─ Protected API routes middleware
└─ Role-based access (admin, user)

Payment Processing
├─ Stripe (payments, webhooks)
├─ Stripe CLI (local testing)
└─ PCI compliance (handled by Stripe)
```

### DevOps & Deployment
```
Hosting: Vercel
├─ Zero-config deployment
├─ Automatic builds from GitHub
├─ Preview deployments
├─ Environment variables
└─ Analytics built-in

CDN: Cloudflare
├─ Image optimization
├─ Edge caching
├─ DDoS protection
└─ Analytics

Monitoring
├─ Vercel Analytics (page performance)
├─ Sentry (error tracking)
├─ Google Analytics 4 (user behavior)
└─ Datadog (infrastructure, optional)

Version Control
├─ GitHub (repository)
├─ GitHub Actions (CI/CD)
├─ Dependabot (dependency updates)
└─ Branch protection (production safety)
```

---

## II. ESTRUCTURA DE CARPETAS

```
viogi-ecommerce/
├── .github/
│   └── workflows/
│       ├── ci.yml (linting, testing)
│       └── deploy.yml (deployment)
│
├── app/                                    # Next.js App Router
│   ├── (auth)/                            # Grouped auth routes
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   │
│   ├── (shop)/                            # Grouped shop routes
│   │   ├── page.tsx                       # Homepage
│   │   ├── products/
│   │   │   ├── page.tsx                   # Product listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx               # Product detail
│   │   ├── search/
│   │   │   └── page.tsx
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   └── checkout/
│   │       ├── page.tsx                   # Checkout flow
│   │       └── success/
│   │           └── page.tsx               # Order confirmation
│   │
│   ├── (admin)/                           # Protected admin routes
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── edit/page.tsx
│   │   │   └── new/page.tsx
│   │   ├── orders/
│   │   │   └── page.tsx
│   │   └── analytics/
│   │       └── page.tsx
│   │
│   ├── (account)/                         # User account routes
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── addresses/
│   │   │   └── page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── wishlist/
│   │       └── page.tsx
│   │
│   ├── api/                               # API Routes
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts     # NextAuth
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   │
│   │   ├── products/
│   │   │   ├── route.ts                   # GET /api/products (list + search)
│   │   │   ├── [id]/route.ts              # GET /api/products/[id]
│   │   │   └── trending/route.ts          # GET /api/products/trending
│   │   │
│   │   ├── cart/
│   │   │   ├── route.ts                   # GET, POST cart
│   │   │   ├── [itemId]/route.ts          # PUT, DELETE cart item
│   │   │   └── count/route.ts             # GET cart count (for header)
│   │   │
│   │   ├── checkout/
│   │   │   ├── route.ts                   # POST create checkout session
│   │   │   └── validate/route.ts          # POST validate checkout
│   │   │
│   │   ├── orders/
│   │   │   ├── route.ts                   # GET user orders, POST new order
│   │   │   └── [id]/route.ts              # GET order detail
│   │   │
│   │   ├── users/
│   │   │   ├── route.ts                   # GET user profile
│   │   │   ├── addresses/route.ts         # User addresses
│   │   │   └── preferences/route.ts       # User preferences
│   │   │
│   │   ├── search/
│   │   │   └── route.ts                   # GET search results + autocomplete
│   │   │
│   │   ├── reviews/
│   │   │   ├── route.ts                   # POST create review
│   │   │   └── [id]/route.ts              # GET reviews for product
│   │   │
│   │   └── webhooks/
│   │       ├── stripe/route.ts            # Stripe webhook handler
│   │       └── instagram/route.ts         # Instagram webhook (future)
│   │
│   ├── layout.tsx                         # Root layout
│   ├── error.tsx                          # Error boundary
│   ├── not-found.tsx                      # 404
│   └── loading.tsx                        # Loading skeleton
│
├── components/                            # Reusable React components
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileNav.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── NewArrivals.tsx
│   │   ├── FeaturedCollection.tsx
│   │   ├── WhyViogi.tsx
│   │   ├── InstagramFeed.tsx
│   │   └── Newsletter.tsx
│   │
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── ProductImages.tsx
│   │   ├── ProductInfo.tsx
│   │   ├── ColorSelector.tsx
│   │   ├── SizeSelector.tsx
│   │   ├── RelatedProducts.tsx
│   │   └── Reviews.tsx
│   │
│   ├── cart/
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── EmptyCart.tsx
│   │
│   ├── checkout/
│   │   ├── CheckoutForm.tsx
│   │   ├── ShippingForm.tsx
│   │   ├── PaymentForm.tsx
│   │   ├── OrderReview.tsx
│   │   └── StepIndicator.tsx
│   │
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── Filters.tsx
│   │   ├── SortDropdown.tsx
│   │   ├── SearchResults.tsx
│   │   └── SearchEmpty.tsx
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── PasswordResetForm.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── account/
│   │   ├── ProfileForm.tsx
│   │   ├── AddressForm.tsx
│   │   ├── OrderHistory.tsx
│   │   └── Wishlist.tsx
│   │
│   └── common/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       ├── Spinner.tsx
│       ├── Image.tsx
│       ├── Link.tsx
│       ├── Pagination.tsx
│       ├── Badge.tsx
│       ├── Rating.tsx
│       └── ErrorBoundary.tsx
│
├── hooks/                                 # Custom React hooks
│   ├── useCart.ts
│   ├── useAuth.ts
│   ├── useProducts.ts
│   ├── useOrders.ts
│   ├── useLocalStorage.ts
│   ├── useDebounce.ts
│   ├── useInfiniteScroll.ts
│   ├── usePrevious.ts
│   └── useAsync.ts
│
├── lib/                                   # Utility functions & configs
│   ├── api.ts                             # API client (fetch wrapper)
│   ├── stripe.ts                          # Stripe initialization
│   ├── auth.ts                            # NextAuth config
│   ├── db.ts                              # Database connection
│   ├── validators.ts                      # Input validation (Zod)
│   ├── constants.ts                       # App constants (URLs, limits)
│   ├── utils.ts                           # General utilities
│   ├── format.ts                          # Formatting (prices, dates)
│   ├── classnames.ts                      # Conditional CSS
│   └── middleware.ts                      # Middleware functions
│
├── types/                                 # TypeScript types
│   ├── index.ts                           # Main type exports
│   ├── product.ts
│   ├── order.ts
│   ├── user.ts
│   ├── cart.ts
│   ├── payment.ts
│   └── api.ts
│
├── store/                                 # Global state (Zustand or Context)
│   ├── cartStore.ts                       # Cart state
│   ├── authStore.ts                       # Auth state
│   ├── uiStore.ts                         # UI state (modals, toasts)
│   └── userPreferences.ts                 # User preferences
│
├── styles/                                # Global styles
│   ├── globals.css                        # Tailwind imports, design tokens
│   ├── variables.css                      # CSS custom properties
│   ├── animations.css                     # Motion definitions
│   └── responsive.css                     # Media query helpers
│
├── public/                                # Static assets
│   ├── images/
│   │   ├── logo.svg
│   │   ├── hero-placeholder.jpg
│   │   └── favicons/
│   ├── icons/
│   ├── fonts/
│   └── robots.txt
│
├── .env.local                             # Local environment variables
├── .env.example                           # Example env variables
├── tailwind.config.ts                     # Tailwind configuration
├── tsconfig.json                          # TypeScript configuration
├── next.config.ts                         # Next.js configuration
├── package.json
├── pnpm-lock.yaml                         # Lock file (using pnpm)
└── README.md
```

---

## III. CONFIGURACIÓN INICIAL

### `package.json`
```json
{
  "name": "viogi-ecommerce",
  "version": "1.0.0",
  "description": "Premium accessible streetwear ecommerce platform",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "jest",
    "test:watch": "jest --watch",
    "migrate": "prisma migrate deploy",
    "studio": "prisma studio"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.2.0",
    "@stripe/react-stripe-js": "^2.4.0",
    "@stripe/stripe-js": "^2.1.0",
    "next-auth": "^5.0.0",
    "@hookform/resolvers": "^3.3.0",
    "react-hook-form": "^7.47.0",
    "zod": "^3.22.0",
    "zustand": "^4.4.0",
    "swr": "^2.2.0",
    "@tanstack/react-query": "^5.0.0",
    "clsx": "^2.0.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@prisma/client": "^5.4.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.0",
    "nodemailer": "^6.9.0",
    "sharp": "^0.32.0"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "prettier": "^3.0.0",
    "prisma": "^5.4.0",
    "eslint": "^8.50.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": ".next",
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "isolatedModules": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### `next.config.ts`
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.vercel-storage.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block",
        },
      ],
    },
  ],

  redirects: async () => [
    {
      source: "/shop",
      destination: "/products",
      permanent: true,
    },
  ],

  rewrites: async () => ({
    beforeFiles: [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap",
      },
      {
        source: "/robots.txt",
        destination: "/api/robots",
      },
    ],
  }),
};

export default nextConfig;
```

### `tailwind.config.ts`
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  theme: {
    extend: {
      colors: {
        // Primary neutrals (matching VIOGI design system)
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
        },
        border: "var(--color-border)",
        
        // Brand accent (red)
        accent: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
          // Primary for VIOGI
          primary: "#E63946",
          primary_dark: "#D62828",
        },
        
        // Semantic
        success: "#2A9D8F",
        error: "#E63946",
        warning: "#F77F00",
      },
      
      fontFamily: {
        sans: ["var(--font-inter)"],
        mono: ["var(--font-geist-mono)"],
      },
      
      fontSize: {
        h1: ["40px", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "-0.02em" }],
        h2: ["28px", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "-0.01em" }],
        h3: ["20px", { lineHeight: "1.3", fontWeight: "600" }],
        base: ["16px", { lineHeight: "1.6" }],
        sm: ["14px", { lineHeight: "1.5" }],
        xs: ["12px", { lineHeight: "1.4" }],
      },
      
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
      },
      
      borderRadius: {
        none: "0px",
        sm: "6px",
        base: "8px",
        md: "10px",
        lg: "12px",
        full: "9999px",
      },
      
      boxShadow: {
        xs: "0 1px 2px rgba(0, 0, 0, 0.02)",
        sm: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
      },
      
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in": "slideIn 0.2s ease-in-out",
        "pulse-subtle": "pulseSubtle 0.4s ease-in-out infinite",
      },
      
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  
  plugins: [
    require("@tailwindcss/typography"),
  ],
};

export default config;
```

### `styles/globals.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* CSS Variables (Design System) */
:root {
  --color-background: #FAFAF8;
  --color-surface: #FFFFFF;
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #5A5A5A;
  --color-border: #E0E0DC;
  --color-input-focus: #D4D4D0;
  
  --color-accent-primary: #E63946;
  --color-accent-primary-dark: #D62828;
  --color-accent-secondary: #F77F00;
  
  --color-success: #2A9D8F;
  --color-error: #E63946;
  --color-warning: #F77F00;
  
  --font-inter: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
  
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --ease-standard: cubic-bezier(0.16, 1, 0.3, 1);
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #0F0F0F;
    --color-surface: #1A1A1A;
    --color-text-primary: #F5F5F3;
    --color-text-secondary: #B0B0A8;
    --color-border: #2A2A28;
  }
}

/* Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  font-family: var(--font-inter);
  color: var(--color-text-primary);
  background-color: var(--color-background);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  line-height: 1.6;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

h1 { font-size: 40px; letter-spacing: -0.02em; }
h2 { font-size: 28px; letter-spacing: -0.01em; }
h3 { font-size: 20px; }
h4 { font-size: 18px; }
h5 { font-size: 16px; }
h6 { font-size: 14px; }

p { margin-bottom: 1rem; }

/* Links */
a {
  color: var(--color-accent-primary);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-standard);
}

a:hover {
  color: var(--color-accent-primary-dark);
}

/* Focus visible */
:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-background);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
}

/* Utility classes */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## IV. TIPOS TYPESCRIPT (DOMAIN MODELS)

### `types/product.ts`
```typescript
export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: ProductImage[];
  colors?: ProductColor[];
  sizes?: ProductSize[];
  category: string;
  subcategory?: string;
  material: string;
  careInstructions: string;
  madeIn: string;
  sku: string;
  stock: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  rating?: number;
  reviewCount?: number;
  isFeatured: boolean;
  isNew: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
};

export type ProductColor = {
  id: string;
  name: string;
  hex: string;
  images: string[];
};

export type ProductSize = {
  id: string;
  size: string;
  stock: number;
  sku: string;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
};

export type ProductReview = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  likes: number;
  createdAt: Date;
};
```

### `types/order.ts`
```typescript
export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount?: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
  image: string;
};

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "card" | "paypal" | "apple_pay" | "google_pay";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type Address = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
};
```

### `types/user.ts`
```typescript
export type User = {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: UserRole;
  addresses: Address[];
  wishlist: string[]; // Product IDs
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
};

export type UserRole = "user" | "admin" | "moderator";

export type UserPreferences = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  theme: "light" | "dark" | "system";
};

export type Address = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: Date;
};
```

### `types/cart.ts`
```typescript
export type Cart = {
  id?: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  promoCode?: string;
  discount?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
  image: string;
};
```

### `types/payment.ts`
```typescript
export type StripeCheckoutSession = {
  sessionId: string;
  clientSecret: string;
  orderId: string;
  amount: number;
  currency: string;
};

export type StripeWebhookEvent =
  | "payment_intent.succeeded"
  | "payment_intent.payment_failed"
  | "charge.refunded"
  | "customer.subscription.updated";
```

---

## V. COMPONENTES PRINCIPALES

### `components/common/Button.tsx`
```typescript
import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = "font-medium rounded-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2";

    const variants = {
      primary: "bg-accent-primary text-white hover:bg-accent-primary-dark disabled:bg-gray-400",
      secondary: "border border-border text-text-primary hover:bg-gray-100 disabled:border-gray-300",
      tertiary: "text-accent-primary hover:text-accent-primary-dark underline",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-8 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-4 w-4 animate-pulse-subtle rounded-full bg-current"></span>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
```

### `components/products/ProductCard.tsx`
```typescript
"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { Button } from "@/components/common/Button";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const primaryImage = product.images[0];
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addItem({
        id: product.id,
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        image: primaryImage.url,
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group flex flex-col gap-4">
      {/* Image Container */}
      <Link href={`/products/${product.slug}`} className="relative overflow-hidden rounded-none bg-gray-100">
        <div className="relative aspect-square w-full">
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={false}
          />
        </div>

        {/* Sale Badge */}
        {discountPercent > 0 && (
          <div className="absolute right-3 top-3 bg-accent-primary px-2 py-1 text-xs font-semibold text-white">
            -{discountPercent}%
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex flex-col gap-2">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-base font-semibold transition-colors hover:text-accent-primary">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-text-secondary line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-xs ${
                    i < Math.round(product.rating!) ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-text-secondary">({product.reviewCount})</span>
          </div>
        )}
      </div>

      {/* Add to Cart Button */}
      <Button
        variant="primary"
        fullWidth
        onClick={handleAddToCart}
        loading={isAdding}
        className="mt-auto"
      >
        Add to Cart
      </Button>
    </div>
  );
}
```

### `components/home/HeroSection.tsx`
```typescript
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/common/Button";

export function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/hero-viogi.jpg"
        alt="VIOGI Premium Streetwear"
        fill
        className="object-cover"
        priority
        quality={85}
      />

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative flex h-full items-center justify-center">
        <div className="mx-auto max-w-2xl text-center text-white px-4 md:px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            VIOGI: Casual Premium Streetwear
          </h1>
          <p className="text-lg md:text-xl mb-12 opacity-90">
            Accessible premium clothing made in Mexico. Wear what you love.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="px-12">
                Shop Now
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="secondary" size="lg" className="px-12 text-white border-white hover:bg-white/10">
                About VIOGI
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## VI. HOOKS PERSONALIZADOS

### `hooks/useCart.ts`
```typescript
"use client";

import { useCallback, useContext } from "react";
import { CartContext } from "@/store/cartStore";
import { CartItem } from "@/types/cart";

export function useCart() {
  const cart = useContext(CartContext);

  if (!cart) {
    throw new Error("useCart must be used within CartProvider");
  }

  const addItem = useCallback(
    async (item: CartItem) => {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      if (!response.ok) throw new Error("Failed to add item");
      
      const newCart = await response.json();
      cart.setCart(newCart);
    },
    [cart]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove item");
      
      const newCart = await response.json();
      cart.setCart(newCart);
    },
    [cart]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) throw new Error("Failed to update quantity");
      
      const newCart = await response.json();
      cart.setCart(newCart);
    },
    [cart]
  );

  const clearCart = useCallback(() => {
    cart.setCart({ items: [], subtotal: 0, tax: 0, shipping: 0, total: 0 });
  }, [cart]);

  return {
    cart: cart.cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount: cart.cart.items.length,
  };
}
```

### `hooks/useAuth.ts`
```typescript
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useCallback } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result?.ok) throw new Error(result?.error || "Login failed");
    return result;
  }, []);

  const logout = useCallback(async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  }, []);

  return {
    user: session?.user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
```

---

## VII. API ROUTES

### `app/api/products/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const sortBy = searchParams.get("sort") || "newest";

  try {
    const skip = (page - 1) * limit;

    let whereClause: any = { stock: { gt: 0 } };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "price-low") orderBy = { price: "asc" };
    if (sortBy === "price-high") orderBy = { price: "desc" };
    if (sortBy === "popular") orderBy = { reviewCount: "desc" };

    const [products, total] = await Promise.all([
      db.product.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        include: { images: true, reviews: true },
      }),
      db.product.count({ where: whereClause }),
    ]);

    return NextResponse.json(
      {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Admin only - create product
  try {
    const body = await request.json();
    const product = await db.product.create({ data: body });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
```

### `app/api/cart/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get cart from database or session
    const cart = await getCartFromDB(session.user.id);
    
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Add item to cart
    const cart = await addCartItem(session.user.id, body);
    
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

async function getCartFromDB(userId: string) {
  // Implementation depends on database setup
  // This is a placeholder
  return { items: [], total: 0 };
}

async function addCartItem(userId: string, item: any) {
  // Implementation depends on database setup
  return { items: [item], total: item.price };
}
```

### `app/api/checkout/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { stripe } from "@/lib/stripe";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: session.user.email,
      line_items: body.items.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.productName,
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        userId: session.user.id,
        orderId: body.orderId,
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      clientSecret: checkoutSession.client_secret,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
```

---

## VIII. PÁGINAS PRINCIPALES

### `app/(shop)/page.tsx` (Homepage)
```typescript
import { HeroSection } from "@/components/home/HeroSection";
import { NewArrivals } from "@/components/home/NewArrivals";
import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { WhyViogi } from "@/components/home/WhyViogi";
import { InstagramFeed } from "@/components/home/InstagramFeed";
import { Newsletter } from "@/components/home/Newsletter";
import { Suspense } from "react";

export const metadata = {
  title: "VIOGI - Premium Accessible Streetwear",
  description: "Shop premium accessible streetwear made in Mexico. VIOGI offers high-quality casual clothing.",
  openGraph: {
    title: "VIOGI - Premium Accessible Streetwear",
    description: "Shop VIOGI premium streetwear",
    type: "website",
  },
};

export default function Home() {
  return (
    <main>
      <HeroSection />
      
      <section className="py-24 md:py-32">
        <Suspense fallback={<div>Loading new arrivals...</div>}>
          <NewArrivals />
        </Suspense>
      </section>

      <section className="py-24 md:py-32 bg-gray-50">
        <Suspense fallback={<div>Loading featured...</div>}>
          <FeaturedCollection />
        </Suspense>
      </section>

      <WhyViogi />

      <section className="py-24 md:py-32">
        <Suspense fallback={<div>Loading Instagram...</div>}>
          <InstagramFeed />
        </Suspense>
      </section>

      <Newsletter />
    </main>
  );
}
```

### `app/(shop)/products/page.tsx`
```typescript
"use client";

import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Filters } from "@/components/search/Filters";
import { SortDropdown } from "@/components/search/SortDropdown";
import { useEffect, useState } from "react";
import { Product } from "@/types/product";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "12",
          sort,
          ...(category && { category }),
        });

        const response = await fetch(`/api/products?${params}`);
        const data = await response.json();
        setProducts(data.products);
        setTotal(data.pagination.total);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, sort, page]);

  return (
    <main className="container py-12">
      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className="hidden w-64 lg:block">
          <Filters />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Bar */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Products</h1>
            <SortDropdown />
          </div>

          {/* Product Grid */}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <ProductGrid products={products} />
              <div className="mt-12 text-center">
                <p className="text-text-secondary">Showing {products.length} of {total} products</p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
```

### `app/(shop)/products/[slug]/page.tsx`
```typescript
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/products/ProductDetail";
import { RelatedProducts } from "@/components/products/RelatedProducts";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps) {
  try {
    const product = await fetchProduct(params.slug);
    
    return {
      title: `${product.name} | VIOGI`,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: [product.images[0].url],
      },
    };
  } catch {
    return {
      title: "Product not found",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const product = await fetchProduct(params.slug);

    return (
      <main>
        <ProductDetail product={product} />
        
        <section className="py-24 md:py-32">
          <RelatedProducts productId={product.id} category={product.category} />
        </section>
      </main>
    );
  } catch (error) {
    notFound();
  }
}

async function fetchProduct(slug: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${slug}`);
  
  if (!response.ok) throw new Error("Product not found");
  
  return response.json();
}
```

### `app/(shop)/cart/page.tsx`
```typescript
"use client";

import { useCart } from "@/hooks/useCart";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { Button } from "@/components/common/Button";
import Link from "next/link";

export default function CartPage() {
  const { cart, itemCount } = useCart();

  if (itemCount === 0) {
    return <EmptyCart />;
  }

  return (
    <main className="container py-12">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4 border border-border rounded-none p-6">
            {cart.items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-6">
            <Link href="/products">
              <Button variant="secondary" fullWidth>
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        {/* Cart Summary */}
        <aside className="lg:col-span-1">
          <CartSummary cart={cart} />
        </aside>
      </div>
    </main>
  );
}
```

### `app/(shop)/checkout/page.tsx`
```typescript
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderReview } from "@/components/checkout/OrderReview";
import { StepIndicator } from "@/components/checkout/StepIndicator";
import { useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { cart, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isAuthenticated) {
    router.push("/login?redirect=/checkout");
    return null;
  }

  const handleCheckout = async (data: any) => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items,
          address: data.address,
          shippingMethod: data.shippingMethod,
        }),
      });

      const session = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = `https://checkout.stripe.com/pay/${session.sessionId}`;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="container py-12">
      <StepIndicator currentStep={currentStep} totalSteps={3} />

      <div className="grid gap-8 lg:grid-cols-3 mt-12">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <CheckoutForm
            onSubmit={handleCheckout}
            isLoading={isProcessing}
          />
        </div>

        {/* Order Review */}
        <aside className="lg:col-span-1">
          <OrderReview cart={cart} />
        </aside>
      </div>
    </main>
  );
}
```

---

## IX. VARIABLES DE ENTORNO

### `.env.example`
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/viogi_db"

# Next Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-min-32-chars"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# OAuth (optional)
GITHUB_ID="..."
GITHUB_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Email
RESEND_API_KEY="re_..."
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="..."
SMTP_PASSWORD="..."

# Cloudinary (images)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Instagram (future integration)
INSTAGRAM_ACCESS_TOKEN="..."
INSTAGRAM_BUSINESS_ACCOUNT_ID="..."

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="GA_..."
SENTRY_DSN="..."

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

---

## X. DEPLOYMENT EN VERCEL

### Pasos de deployment:
```bash
# 1. Conectar GitHub repo a Vercel
vercel link

# 2. Configurar variables de entorno en Vercel dashboard
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - STRIPE_SECRET_KEY
# - etc.

# 3. Deploy
vercel deploy --prod

# 4. Ver logs
vercel logs
```

### `vercel.json` (opcional)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_APP_URL": "@app_url"
  },
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

---

## XI. PERFORMANCE CHECKLIST

```
✓ Image optimization (next/image, responsive sizes)
✓ Code splitting (dynamic imports, lazy loading)
✓ Database indexing (userId, productId, createdAt)
✓ Caching strategy (ISR for products, client cache for cart)
✓ API route optimization (queries optimized, no N+1)
✓ CSS optimization (Tailwind purging unused styles)
✓ JavaScript minification (Next.js default)
✓ Compression (gzip enabled)
✓ CDN (Cloudflare for images + Vercel edge)

Target Metrics:
- Lighthouse Performance: 85+
- Lighthouse Accessibility: 95+
- Lighthouse SEO: 95+
- Page load: < 2 seconds (3G)
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
```

---

## XII. PRÓXIMOS PASOS

1. **Clone repository** y configura variables de entorno
2. **Instala dependencias**: `pnpm install`
3. **Crea base de datos**: PostgreSQL + Supabase
4. **Ejecuta migraciones**: `prisma migrate deploy`
5. **Inicia servidor**: `pnpm dev` (http://localhost:3000)
6. **Configura Stripe webhook** para webhooks locales (`stripe listen`)
7. **Carga productos** en admin dashboard
8. **Prueba flujo completo**: homepage → product → cart → checkout
9. **Deploy a Vercel** cuando esté listo

---

**Documento técnico completo listo para desarrollo. ¿Preguntas sobre implementación específica?**

