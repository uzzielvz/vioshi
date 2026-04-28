-- =============================================================================
-- VIOGI — Initial Schema
-- Supabase / PostgreSQL
-- Moneda fuente: MXN. USD se deriva dividiendo por el tipo de cambio en el cliente.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Helper: auto-actualizar updated_at en cada UPDATE
-- ---------------------------------------------------------------------------
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- Secuencia para números de orden legibles (VIO-2026-0001)
-- ---------------------------------------------------------------------------
create sequence order_number_seq start 1;

-- =============================================================================
-- 1. PROFILES
-- Extiende auth.users de Supabase. Un registro por usuario autenticado.
-- =============================================================================
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  name                text,
  phone               text,
  role                text not null default 'user'
                      check (role in ('user', 'admin', 'moderator')),
  email_notifications boolean not null default true,
  marketing_emails    boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function handle_updated_at();

-- =============================================================================
-- 2. ADDRESSES
-- Direcciones guardadas por usuario. También se referencia desde orders.
-- =============================================================================
create table public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  first_name  text not null,
  last_name   text not null,
  phone       text not null,
  street      text not null,
  apartment   text,
  colony      text,                    -- colonia (campo SEPOMEX)
  city        text not null,
  state       text not null,
  zip_code    text not null,
  country     text not null default 'MX',
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index addresses_user_id_idx on public.addresses(user_id);

-- =============================================================================
-- 3. CATEGORIES
-- Categorías del catálogo. name_es / name_en para i18n sin depender de next-intl.
-- =============================================================================
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name_es     text not null,
  name_en     text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- =============================================================================
-- 4. PRODUCTS
-- Catálogo principal. Precio en MXN.
-- sold_out: override manual del admin (además del stock calculado de variants).
-- =============================================================================
create table public.products (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text unique not null,
  name                 text not null,
  description          text,
  price_mxn            numeric(10,2) not null check (price_mxn > 0),
  original_price_mxn   numeric(10,2) check (original_price_mxn > 0),  -- precio antes de descuento
  category_id          uuid references public.categories(id),
  sku                  text unique,
  material             text,
  made_in              text not null default 'México',
  is_featured          boolean not null default false,
  is_new               boolean not null default false,
  sold_out             boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger products_updated_at
  before update on public.products
  for each row execute function handle_updated_at();

create index products_category_id_idx on public.products(category_id);
create index products_slug_idx        on public.products(slug);
create index products_is_new_idx      on public.products(is_new) where is_new = true;
create index products_is_featured_idx on public.products(is_featured) where is_featured = true;

-- =============================================================================
-- 5. PRODUCT_IMAGES
-- Galería de imágenes por producto. is_primary = imagen principal (thumbnail).
-- =============================================================================
create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  url         text not null,
  alt         text,
  is_primary  boolean not null default false,
  sort_order  int not null default 0
);

create index product_images_product_id_idx on public.product_images(product_id);

-- =============================================================================
-- 6. PRODUCT_VARIANTS
-- Variantes por talla y/o color con stock individual.
-- Fase actual: cada producto tendrá una sola fila (pieza única).
-- Fase futura: múltiples filas por producto (S/M/L/XL, colores).
-- price_override_mxn: null = hereda price_mxn del producto padre.
-- =============================================================================
create table public.product_variants (
  id                   uuid primary key default gen_random_uuid(),
  product_id           uuid not null references public.products(id) on delete cascade,
  size                 text,                            -- null = no aplica (bolsos, accesorios)
  color                text,
  color_hex            text,
  sku                  text unique,
  stock                int not null default 0 check (stock >= 0),
  price_override_mxn   numeric(10,2) check (price_override_mxn > 0),
  created_at           timestamptz not null default now()
);

create index product_variants_product_id_idx on public.product_variants(product_id);

-- =============================================================================
-- 7. PICKUP_POINTS
-- Puntos de recolección. Migrado desde lib/pickupPoints.ts.
-- additional_cost_mxn: costo extra sobre el total del pedido.
-- =============================================================================
create table public.pickup_points (
  id                   text primary key,               -- ej. 'flagship-cdmx'
  name                 text not null,
  address              text not null,
  city                 text not null,
  state                text not null,
  type                 text not null check (type in ('flagship', 'retail', 'partner')),
  additional_cost_mxn  numeric(8,2) not null default 0,
  available_hours      text,
  available_days       text,
  estimated_days       text,
  is_active            boolean not null default true
);

-- =============================================================================
-- 8. ORDERS
-- Pedidos. user_id nullable para soportar guest checkout.
-- Todos los montos en MXN. exchange_rate guarda el tipo de cambio al momento
-- de la compra para referencia histórica.
-- =============================================================================
create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  order_number        text unique not null default (
                        'VIO-' || to_char(now(), 'YYYY') || '-' ||
                        lpad(nextval('order_number_seq')::text, 4, '0')
                      ),
  user_id             uuid references public.profiles(id),  -- null = guest
  email               text not null,

  -- Montos en MXN
  subtotal_mxn        numeric(10,2) not null,
  tax_mxn             numeric(10,2) not null,          -- IVA 16%
  shipping_mxn        numeric(10,2) not null default 0,
  discount_mxn        numeric(10,2) not null default 0,
  total_mxn           numeric(10,2) not null,
  exchange_rate       numeric(10,4),                   -- MXN/USD al momento de la compra

  -- Estado
  status              text not null default 'pending'
                      check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method      text
                      check (payment_method in ('card', 'paypal', 'apple_pay', 'google_pay')),
  payment_status      text not null default 'pending'
                      check (payment_status in ('pending', 'completed', 'failed', 'refunded')),
  payment_reference   text,                            -- ID de Stripe / MercadoPago

  -- Entrega
  delivery_method     text not null check (delivery_method in ('home', 'pickup')),

  -- Envío a domicilio
  shipping_address_id uuid references public.addresses(id),
  shipping_method     text check (shipping_method in ('standard', 'express')),
  tracking_number     text,
  estimated_delivery  date,

  -- Pickup
  pickup_point_id     text references public.pickup_points(id),
  pickup_date         date,
  pickup_time_slot    text check (pickup_time_slot in ('morning', 'afternoon', 'evening')),

  -- Facturación CFDI (via Facturapi u otro proveedor externo)
  invoice_requested   boolean not null default false,
  cfdi_uuid           text,                            -- folio fiscal del SAT
  cfdi_pdf_url        text,                            -- URL al comprobante PDF

  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger orders_updated_at
  before update on public.orders
  for each row execute function handle_updated_at();

create index orders_user_id_idx    on public.orders(user_id);
create index orders_status_idx     on public.orders(status);
create index orders_created_at_idx on public.orders(created_at desc);

-- =============================================================================
-- 9. ORDER_ITEMS
-- Ítems de cada pedido. Los campos de producto son SNAPSHOTS inmutables:
-- aunque se edite el producto en el futuro, el historial no cambia.
-- =============================================================================
create table public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders(id) on delete cascade,
  product_id       uuid references public.products(id),          -- null si el producto fue eliminado
  variant_id       uuid references public.product_variants(id),  -- null si aplica

  -- Snapshots al momento de la compra
  product_name     text not null,
  product_image    text,
  size             text,
  color            text,
  quantity         int not null check (quantity > 0),
  unit_price_mxn   numeric(10,2) not null,
  total_price_mxn  numeric(10,2) not null
);

create index order_items_order_id_idx on public.order_items(order_id);

-- =============================================================================
-- 10. WISHLIST_ITEMS
-- Lista de deseos por usuario. Clave compuesta evita duplicados.
-- =============================================================================
create table public.wishlist_items (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  added_at    timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index wishlist_items_user_id_idx on public.wishlist_items(user_id);

-- =============================================================================
-- 11. PROMO_CODES
-- Códigos de descuento. El campo en el checkout está oculto hasta Fase 2,
-- pero la tabla queda lista para cuando se active.
-- discount_type 'percentage': descuento en %. 'fixed': descuento en MXN fijo.
-- =============================================================================
create table public.promo_codes (
  id              uuid primary key default gen_random_uuid(),
  code            text unique not null,
  discount_type   text not null check (discount_type in ('percentage', 'fixed')),
  discount_value  numeric(10,2) not null check (discount_value > 0),
  min_order_mxn   numeric(10,2) not null default 0,
  max_uses        int,                                 -- null = usos ilimitados
  used_count      int not null default 0,
  valid_from      timestamptz,
  valid_until     timestamptz,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.profiles        enable row level security;
alter table public.addresses       enable row level security;
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.product_images  enable row level security;
alter table public.product_variants enable row level security;
alter table public.pickup_points   enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.wishlist_items  enable row level security;
alter table public.promo_codes     enable row level security;

-- Profiles
create policy "profile_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profile_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profile_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Addresses
create policy "address_all_own" on public.addresses
  for all using (auth.uid() = user_id);

-- Catálogo: lectura pública
create policy "categories_public_read" on public.categories
  for select using (true);
create policy "products_public_read" on public.products
  for select using (true);
create policy "product_images_public_read" on public.product_images
  for select using (true);
create policy "product_variants_public_read" on public.product_variants
  for select using (true);
create policy "pickup_points_public_read" on public.pickup_points
  for select using (is_active = true);
create policy "promo_codes_public_read" on public.promo_codes
  for select using (is_active = true);

-- Orders: el usuario ve sus propios pedidos; guest checkout permitido en insert
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);
create policy "orders_insert_any" on public.orders
  for insert with check (true);           -- guest checkout: sin restricción en insert

-- Order items: accesibles si el usuario es dueño del pedido
create policy "order_items_select_own" on public.order_items
  for select using (
    order_id in (select id from public.orders where user_id = auth.uid())
  );
create policy "order_items_insert_any" on public.order_items
  for insert with check (true);           -- se inserta junto con el pedido

-- Wishlist
create policy "wishlist_all_own" on public.wishlist_items
  for all using (auth.uid() = user_id);

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Categorías (alineadas con CATEGORIES en lib/constants.ts)
insert into public.categories (slug, name_es, name_en, sort_order) values
  ('all',        'Todo',         'All',          0),
  ('playeras',   'Playeras',     'T-Shirts',     1),
  ('hoodie',     'Hoodies',      'Hoodies',      2),
  ('chamarra',   'Chamarras',    'Jackets',      3),
  ('camisas',    'Camisas',      'Shirts',       4),
  ('pants',      'Pants',        'Pants',        5),
  ('jeans',      'Jeans',        'Jeans',        6),
  ('accesorios', 'Accesorios',   'Accessories',  7),
  ('bolsos',     'Bolsos',       'Bags',         8);

-- Puntos de pickup (migrado desde lib/pickupPoints.ts)
insert into public.pickup_points
  (id, name, address, city, state, type, additional_cost_mxn, available_hours, estimated_days, is_active)
values
  ('flagship-cdmx',  'VIOGI Flagship - Ciudad de México', 'Av. Reforma 222, Colonia Juárez',        'Ciudad de México', 'CDMX',            'flagship',  0,  'Lun-Dom 11:00-20:00',                   'Disponible en 2-3 días', true),
  ('flagship-gdl',   'VIOGI Flagship - Guadalajara',      'Av. Chapultepec 342, Americana',          'Guadalajara',      'Jalisco',         'flagship',  0,  'Lun-Dom 11:00-20:00',                   'Disponible en 2-3 días', true),
  ('retail-mty',     'VIOGI Store - Monterrey',           'Av. Constitución 2000, Centro',           'Monterrey',        'Nuevo León',      'retail',   50,  'Lun-Sáb 10:00-19:00',                   'Disponible en 3-5 días', true),
  ('retail-qro',     'VIOGI Store - Querétaro',           'Blvd. Bernardo Quintana 101, Centro Sur', 'Querétaro',        'Querétaro',       'retail',   50,  'Lun-Sáb 10:00-19:00',                   'Disponible en 3-5 días', true),
  ('partner-puebla', 'Urban Collective - Puebla',         'Av. Juárez 2510, La Paz',                 'Puebla',           'Puebla',          'partner',  25,  'Lun-Vie 12:00-20:00, Sáb 11:00-18:00',  'Disponible en 4-6 días', true),
  ('partner-tijuana','Street Corner - Tijuana',           'Av. Revolución 1045, Zona Centro',        'Tijuana',          'Baja California', 'partner',  75,  'Mar-Dom 13:00-21:00',                   'Disponible en 5-7 días', true),
  ('partner-cancun', 'Beach Culture - Cancún',            'Av. Tulum 260, SM 7',                     'Cancún',           'Quintana Roo',    'partner',  60,  'Lun-Dom 10:00-22:00',                   'Disponible en 5-7 días', true),
  ('partner-merida', 'Centro Urbano - Mérida',            'Calle 60 #350, Centro',                   'Mérida',           'Yucatán',         'partner',  40,  'Lun-Sáb 11:00-19:00',                   'Disponible en 4-6 días', true);
