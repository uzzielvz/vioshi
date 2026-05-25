# Diagrama ER — Viogi (Supabase / PostgreSQL)

Fuente de verdad: `supabase/migrations/0001`–`0006`.

Para **compartir sin imágenes rotas**: envía este archivo `.md`, un gist, o el bloque `mermaid` en [mermaid.live](https://mermaid.live) (Export → SVG/PNG). GitHub y Notion renderizan Mermaid en markdown.

---

## Diagrama ER (Mermaid)

Copia desde ` ```mermaid ` hasta el cierre:

```mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : "1:1 extiende"
    PROFILES ||--o{ ADDRESSES : "tiene"
    PROFILES ||--o{ ORDERS : "realiza"
    PROFILES ||--o{ WISHLIST_ITEMS : "guarda"

    CATEGORIES ||--o{ PRODUCTS : "agrupa"
    PRODUCTS ||--o{ PRODUCT_IMAGES : "tiene"
    PRODUCTS ||--o{ PRODUCT_VARIANTS : "variantes"
    PRODUCTS ||--o{ PRODUCT_ATTRIBUTES : "atributos"
    PRODUCTS ||--o{ WISHLIST_ITEMS : "en"
    PRODUCTS ||--o{ ORDER_ITEMS : "referencia"

    PRODUCT_VARIANTS ||--o{ ORDER_ITEMS : "opcional"

    PICKUP_POINTS ||--o{ ORDERS : "recolección"
    ADDRESSES ||--o{ ORDERS : "envío domicilio"

    ORDERS ||--|{ ORDER_ITEMS : "contiene"

    AUTH_USERS {
        uuid id PK
        text email
        timestamptz created_at
    }

    PROFILES {
        uuid id PK_FK
        text name
        text phone
        text role "user|admin|moderator"
        boolean email_notifications
        boolean marketing_emails
        timestamptz created_at
        timestamptz updated_at
    }

    ADDRESSES {
        uuid id PK
        uuid user_id FK
        text first_name
        text last_name
        text phone
        text street
        text apartment
        text colony
        text city
        text state
        text zip_code
        text country
        boolean is_default
        timestamptz created_at
    }

    CATEGORIES {
        uuid id PK
        text slug UK
        text name_es
        text name_en
        int sort_order
        timestamptz created_at
    }

    PRODUCTS {
        uuid id PK
        text slug UK
        text name
        text description
        numeric price_mxn
        numeric original_price_mxn
        uuid category_id FK
        text sku UK
        text material
        text made_in
        boolean is_featured
        boolean is_new
        boolean sold_out
        vector embedding "768 dims"
        timestamptz created_at
        timestamptz updated_at
    }

    PRODUCT_IMAGES {
        uuid id PK
        uuid product_id FK
        text url
        text alt
        boolean is_primary
        int sort_order
    }

    PRODUCT_VARIANTS {
        uuid id PK
        uuid product_id FK
        text size
        text color
        text color_hex
        text sku UK
        int stock
        numeric price_override_mxn
        timestamptz created_at
    }

    PRODUCT_ATTRIBUTES {
        uuid id PK
        uuid product_id FK
        text key
        text value
        int sort_order
    }

    PICKUP_POINTS {
        text id PK
        text name
        text address
        text city
        text state
        text type "flagship|retail|partner"
        numeric additional_cost_mxn
        text available_hours
        text available_days
        text estimated_days
        boolean is_active
    }

    ORDERS {
        uuid id PK
        text order_number UK
        uuid user_id FK "nullable guest"
        text email
        text guest_token "HMAC lookup invitado"
        numeric subtotal_mxn
        numeric tax_mxn
        numeric shipping_mxn
        numeric discount_mxn
        numeric total_mxn
        numeric exchange_rate
        text status
        text payment_method
        text payment_status
        text payment_reference
        text delivery_method "home|pickup"
        uuid shipping_address_id FK
        text shipping_method
        text tracking_number
        date estimated_delivery
        text pickup_point_id FK
        date pickup_date
        text pickup_time_slot
        boolean invoice_requested
        text cfdi_uuid
        text cfdi_pdf_url
        text notes
        timestamptz created_at
        timestamptz updated_at
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id FK "nullable"
        uuid variant_id FK "nullable"
        text product_name "snapshot"
        text product_image "snapshot"
        text size
        text color
        int quantity
        numeric unit_price_mxn
        numeric total_price_mxn
    }

    WISHLIST_ITEMS {
        uuid user_id PK_FK
        uuid product_id PK_FK
        timestamptz added_at
    }

    PROMO_CODES {
        uuid id PK
        text code UK
        text discount_type "percentage|fixed"
        numeric discount_value
        numeric min_order_mxn
        int max_uses
        int used_count
        timestamptz valid_from
        timestamptz valid_until
        boolean is_active
        timestamptz created_at
    }
```

---

## Vista ASCII (módulos)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTENTICACIÓN (Supabase Auth)                        │
│  auth.users ──1:1──► profiles ──1:N──► addresses                            │
│                      │                                                       │
│                      ├──1:N──► orders (user_id nullable = guest)            │
│                      └──1:N──► wishlist_items                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CATÁLOGO                                        │
│  categories ──1:N──► products ──┬──1:N──► product_images                    │
│                                 ├──1:N──► product_variants                  │
│                                 ├──1:N──► product_attributes                │
│                                 └──N:M──► wishlist_items                    │
│                                 (+ embedding vector(768) para visual search) │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         PEDIDOS / CHECKOUT (Stripe)                          │
│  orders ──1:N──► order_items ──?──► products / product_variants           │
│    │              (snapshots de precio/nombre/imagen)                        │
│    ├──► addresses (shipping_address_id)                                     │
│    ├──► pickup_points (pickup_point_id)                                     │
│    └── guest_token (lookup invitado post-compra)                            │
│  promo_codes (sin FK a orders aún)                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tablas (`public` + `auth.users`)

| Tabla | PK | Relaciones principales |
|-------|-----|------------------------|
| `auth.users` | `id` | → `profiles` (1:1) |
| `profiles` | `id` = FK `auth.users` | → `addresses`, `orders`, `wishlist_items` |
| `addresses` | `id` | → `profiles`; ← `orders.shipping_address_id` |
| `categories` | `id` | → `products` |
| `products` | `id` | → `categories`; hijos: images, variants, attributes |
| `product_images` | `id` | → `products` CASCADE |
| `product_variants` | `id` | → `products` CASCADE |
| `product_attributes` | `id` | → `products` CASCADE |
| `pickup_points` | `id` (text) | ← `orders.pickup_point_id` |
| `orders` | `id` | → `profiles?`, `addresses?`, `pickup_points?`; `guest_token`; → `order_items` |
| `order_items` | `id` | → `orders`; snapshots de producto |
| `wishlist_items` | (`user_id`, `product_id`) | → `profiles`, `products` |
| `promo_codes` | `id` | Sin FK (futuro) |

---

## Objetos adicionales

| Objeto | Tipo | Función |
|--------|------|---------|
| `order_number_seq` | Secuencia | `VIO-YYYY-NNNN` |
| `handle_updated_at()` | Trigger | `updated_at` en profiles/products/orders |
| `handle_new_user()` | Trigger | Crea `profiles` al registrarse |
| `match_products_by_image()` | RPC | Búsqueda visual (pgvector) |

---

## Migraciones

| Archivo | Contenido |
|---------|-----------|
| `0001_initial_schema.sql` | Tablas base + RLS |
| `0002_handle_new_user.sql` | Trigger profiles |
| `0003_pgvector_and_embeddings.sql` | `embedding`, RPC match |
| `0004_product_attributes.sql` | `product_attributes` |
| `0005_hide_product_embedding_from_public.sql` | REVOKE `embedding` |
| `0006_orders_guest_token.sql` | `orders.guest_token` |
