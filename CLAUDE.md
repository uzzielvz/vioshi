# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VIOGI is a premium streetwear e-commerce website built with Next.js 14 (App Router), React 18, TypeScript, and Tailwind CSS. The design is inspired by Stüssy with a minimalist black/white aesthetic.

## Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## Architecture

### State Management
- **Cart**: Uses React Context API (`store/cartStore.tsx`) with localStorage persistence
- The `CartProvider` wraps the app in `app/layout.tsx`
- Access cart state via the `useCart()` hook

### Routing Structure
- `app/` - Next.js App Router pages
  - `(shop)/cart/` - Route group for shopping cart
  - `collections/[category]/` - Dynamic category pages
  - `products/[slug]/` - Dynamic product pages
- Route groups (parentheses folders) share layouts without affecting URL paths

### Data Layer
- **Products**: Currently mock data in `lib/products.ts` with `getProducts()` and `getProductBySlug()` functions
- **Types**: Centralized in `types/` - import from `@/types`
- **Constants**: App-wide constants in `lib/constants.ts` (tax rates, shipping costs, storage keys)

### Component Organization
- `components/common/` - Reusable UI components (Button, Input, Badge, Spinner)
- `components/` - Feature components (Header, Footer, ProductCard, ProductGrid)

### Key Patterns
- **Server vs Client Components**: Use `"use client"` directive only when needed (interactivity, hooks, browser APIs)
- **Fixed Header Compensation**: The header is `fixed top-0`. All page `<main>` elements need `pt-16` to prevent content overlap
- **Path Aliases**: Use `@/` for absolute imports (configured in tsconfig.json)

### Styling
- **Tailwind CSS** with custom config in `tailwind.config.ts`
- **Fonts**: Bebas Neue for logo (`font-logo`), Inter for body text
- **CSS Variables**: Defined in `app/globals.css`
- **Design Language**: Minimalist, high contrast (black/white), uppercase navigation text with `tracking-wider`

### LocalStorage Keys
- `viogi_cart` - Cart data persistence
- `viogi_wishlist` - Wishlist items
- `viogi_recent_products` - Recently viewed products

## Code Style

- TypeScript strict mode enabled
- Functional components with hooks
- Use `clsx` for conditional class names (already a dependency)
- Spanish language for product content, English for code/comments
- Minimal comments - only comment complex logic, not obvious code
