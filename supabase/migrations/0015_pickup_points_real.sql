-- =============================================================================
-- 0015: Puntos de pickup reales (Valle de Toluca) + campos de red Maneki
--
-- - Desactiva el seed ficticio (CDMX/GDL/MTY/…). No borra filas: orders puede
--   referenciar pickup_point_id.
-- - Agrega municipality, whatsapp, maps_url, transfer_day, is_dropoff.
-- - Semilla: Rectoría (único dropoff), Colón, Xonacatlán local + red con traslado.
-- - Costos iniciales editables: hub/locales $10, red con traslado $20.
--   transfer_day: 0=dom … 6=sáb (mismo criterio que JS Date#getDay).
-- =============================================================================

alter table public.pickup_points
  add column if not exists municipality text,
  add column if not exists whatsapp text,
  add column if not exists maps_url text,
  add column if not exists transfer_day smallint
    check (transfer_day is null or transfer_day between 0 and 6),
  add column if not exists is_dropoff boolean not null default false;

comment on column public.pickup_points.municipality is
  'Municipio para agrupar en checkout (ej. Toluca, Metepec).';
comment on column public.pickup_points.whatsapp is
  'WhatsApp exclusivo del punto, dígitos con lada.';
comment on column public.pickup_points.maps_url is
  'Link corto de Google Maps.';
comment on column public.pickup_points.transfer_day is
  'Día de la semana en que llega el traslado desde Rectoría. null = sin traslado (hub o entrega local). 0=dom … 6=sáb.';
comment on column public.pickup_points.is_dropoff is
  'true = los vendedores pueden dejar paquetes aquí. Solo Rectoría al inicio.';

-- Apagar puntos ficticios del seed 0001
update public.pickup_points
set is_active = false
where id in (
  'flagship-cdmx',
  'flagship-gdl',
  'retail-mty',
  'retail-qro',
  'partner-puebla',
  'partner-tijuana',
  'partner-cancun',
  'partner-merida'
);

-- ---------------------------------------------------------------------------
-- Toluca / Xonacatlán (uso actual)
-- ---------------------------------------------------------------------------
insert into public.pickup_points (
  id, name, address, city, state, type,
  additional_cost_mxn, available_hours, available_days, estimated_days,
  is_active, municipality, whatsapp, maps_url, transfer_day, is_dropoff
) values
(
  'rectoria-toluca',
  'Rectoría — Maneki',
  'Instituto Literario 305',
  'Toluca',
  'México',
  'partner',
  10,
  '10:00–18:00',
  'Lun–Dom',
  'Listo el mismo día si se deja en horario de depósito',
  true,
  'Toluca',
  null,
  null,
  null,
  true
),
(
  'colon-toluca',
  'Pick Up Colón',
  'Jesús Carranza 331',
  'Toluca',
  'México',
  'partner',
  10,
  null,
  null,
  'Entrega local (sin traslado semanal)',
  true,
  'Toluca',
  null,
  null,
  null,
  false
),
(
  'xonacatlan-independencia',
  'Pick Up Xonacatlán',
  'Independencia, Xonacatlán',
  'Xonacatlán',
  'México',
  'partner',
  10,
  'Desde 11:00',
  'Lun y Mié',
  'Entrega local — confirmar si es el mismo que C&PC',
  true,
  'Xonacatlán',
  null,
  null,
  null,
  false
)
on conflict (id) do update set
  name = excluded.name,
  address = excluded.address,
  city = excluded.city,
  state = excluded.state,
  type = excluded.type,
  additional_cost_mxn = excluded.additional_cost_mxn,
  available_hours = excluded.available_hours,
  available_days = excluded.available_days,
  estimated_days = excluded.estimated_days,
  is_active = excluded.is_active,
  municipality = excluded.municipality,
  whatsapp = excluded.whatsapp,
  maps_url = excluded.maps_url,
  transfer_day = excluded.transfer_day,
  is_dropoff = excluded.is_dropoff;

-- ---------------------------------------------------------------------------
-- Red con traslado desde Rectoría ($20 semilla; editable)
-- transfer_day: Lun=1 Mar=2 Mié=3 Jue=4 Vie=5 Sáb=6 Dom=0
-- ---------------------------------------------------------------------------
insert into public.pickup_points (
  id, name, address, city, state, type,
  additional_cost_mxn, available_hours, available_days, estimated_days,
  is_active, municipality, whatsapp, maps_url, transfer_day, is_dropoff
) values
(
  'tenango-las-chulas',
  'Las Chul&s',
  'Constitución Nte 201, Centro, 52300',
  'Tenango de Arista',
  'México',
  'partner',
  20,
  'L–S 11:00–18:00 · D 12:00–17:00',
  'Lun–Dom',
  'Traslado los sábados desde Rectoría',
  true,
  'Tenango de Arista',
  '7228721207',
  'https://maps.app.goo.gl/kDjrvnf7MxFQxZTCA',
  6,
  false
),
(
  'metepec-centro',
  'Cieuto Metepec',
  'Miguel Hidalgo 59-61, Santa Cruz, 52140',
  'Metepec',
  'México',
  'partner',
  20,
  'Ma–S 10:00–18:00',
  'Mar–Sáb',
  'Traslado los lunes desde Rectoría',
  true,
  'Metepec',
  '7221687630',
  'https://maps.app.goo.gl/mmUFvENLimhisuoW8',
  1,
  false
),
(
  'xonacatlan-cpc',
  'C&PC Paquetería',
  'Gustavo A. Vicencio Mz 003, Xonacatlán de Vicencio',
  'Xonacatlán',
  'México',
  'partner',
  20,
  'L–S 09:00–20:00 · D 10:30–20:00',
  'Lun–Dom',
  'Traslado los miércoles desde Rectoría',
  true,
  'Xonacatlán',
  '7293835167',
  'https://maps.app.goo.gl/yjcVmA5tr65qPQMo6',
  3,
  false
),
(
  'san-mateo-kelly',
  'Kelly Bazar',
  'Av. Lic. Benito Juárez 113, San Miguel, 52104',
  'San Mateo Atenco',
  'México',
  'partner',
  20,
  'L–D 10:00–18:00',
  'Lun–Dom',
  'Traslado los viernes desde Rectoría',
  true,
  'San Mateo Atenco',
  '7227458615',
  'https://maps.app.goo.gl/tXAMwfpoca16eFjx7',
  5,
  false
),
(
  'almoloya-pendiente',
  'Almoloya (datos pendientes)',
  'Por confirmar',
  'Almoloya',
  'México',
  'partner',
  20,
  null,
  null,
  'Traslado TBD — punto inactivo hasta completar dirección',
  false,
  'Almoloya',
  '7222603062',
  null,
  null,
  false
),
(
  'lerma-martell',
  'Agencia Martell',
  'Nicolás Bravo 101, El Cerrillo Vista Hermosa, 50235',
  'Lerma',
  'México',
  'partner',
  20,
  'L–V 08:30–18:30',
  'Lun–Vie',
  'Traslado los lunes desde Rectoría',
  true,
  'Lerma',
  '7206226275',
  'https://maps.app.goo.gl/W7E6sBmi26kDQcd57',
  1,
  false
),
(
  'mexicaltzingo-maneki',
  'Maneki Lan Center',
  'C. Josefa Ortiz de Domínguez 405',
  'Mexicaltzingo',
  'México',
  'partner',
  20,
  'L–D 12:00–21:00',
  'Lun–Dom',
  'Traslado los sábados desde Rectoría',
  true,
  'Mexicaltzingo',
  '7203562803',
  'https://maps.app.goo.gl/DBpZjEAr4BX74whJ6',
  6,
  false
),
(
  'ocoyoacac-buho',
  'Búho Express',
  'Av. 16 de Septiembre, 52740',
  'Ocoyoacac',
  'México',
  'partner',
  20,
  'L–V 10:00–14:00 y 15:00–18:00 · S 10:00–15:00',
  'Lun–Sáb',
  'Traslado los viernes desde Rectoría',
  true,
  'Ocoyoacac',
  '7221853265',
  'https://maps.app.goo.gl/1EXLFcLXJeEkx2BM7',
  5,
  false
),
(
  'san-antonio-nenes',
  'Carnicería Los Nenes — Suc. San Lucas',
  '20 de Noviembre 110',
  'San Antonio la Isla',
  'México',
  'partner',
  20,
  'L–S 10:00–16:00',
  'Lun–Sáb',
  'Traslado los sábados desde Rectoría',
  true,
  'San Antonio la Isla',
  '7291311121',
  'https://maps.app.goo.gl/vuBQKru6Tpecc4w27',
  6,
  false
),
(
  'tianguistenco-pendiente',
  'Santiago Tianguistenco (datos pendientes)',
  'Por confirmar',
  'Santiago Tianguistenco',
  'México',
  'partner',
  20,
  null,
  null,
  'Traslado TBD — punto inactivo hasta completar dirección',
  false,
  'Santiago Tianguistenco',
  '7222460483',
  null,
  null,
  false
),
(
  'temoaya-el-giro',
  'El Giro MX',
  'México 20, Barrio de Molino Arriba, 50874',
  'Temoaya',
  'México',
  'partner',
  20,
  'L–V 08:00–19:00 · S–D 09:00–19:00',
  'Lun–Dom',
  'Traslado los viernes desde Rectoría',
  true,
  'Temoaya',
  '5636611877',
  'https://maps.app.goo.gl/tKjenUxfeDnDzsh38',
  5,
  false
),
(
  'tenancingo-nuholly',
  'Nuholly Showroom',
  'Hidalgo Pte. 202, 52400',
  'Tenancingo de Degollado',
  'México',
  'partner',
  20,
  'L–V 11:00–18:00 · S–D 10:00–16:00',
  'Lun–Dom',
  'Traslado los sábados desde Rectoría — verificar Maps',
  true,
  'Tenancingo de Degollado',
  '7141021500',
  null,
  6,
  false
)
on conflict (id) do update set
  name = excluded.name,
  address = excluded.address,
  city = excluded.city,
  state = excluded.state,
  additional_cost_mxn = excluded.additional_cost_mxn,
  available_hours = excluded.available_hours,
  available_days = excluded.available_days,
  estimated_days = excluded.estimated_days,
  is_active = excluded.is_active,
  municipality = excluded.municipality,
  whatsapp = excluded.whatsapp,
  maps_url = excluded.maps_url,
  transfer_day = excluded.transfer_day,
  is_dropoff = excluded.is_dropoff;
