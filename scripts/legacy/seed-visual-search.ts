/**
 * VIOGI — Visual Search Seed
 *
 * Inserta 12 productos sintéticos (prefijo "[seed]" en description) en
 * la DB para tener material sobre el cual generar embeddings y demostrar
 * la búsqueda visual. Idempotente: borra seeds previos antes de insertar.
 *
 * Uso: npx tsx scripts/seed-visual-search.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

type Seed = {
  name: string;
  description: string;
  price_mxn: number;
  category_slug: string;
  image_url: string;
};

// Mapeo de categorías plan → slugs reales en 0001_initial_schema.sql
// Slugs reales: 'playeras' | 'hoodie' | 'chamarra' | 'camisas' | 'pants' | 'jeans' | 'accesorios' | 'bolsos'
const SEED_PRODUCTS: Seed[] = [
  {
    name: 'Hoodie oversized beige',
    description: '[seed] Hoodie oversized en color beige cálido, silueta relajada y caída suave para un look streetwear minimalista.',
    price_mxn: 850,
    category_slug: 'hoodie',
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
  },
  {
    name: 'Playera blanca minimalista',
    description: '[seed] Playera blanca de algodón con corte regular y diseño limpio sin estampados, estilo minimalista atemporal.',
    price_mxn: 420,
    category_slug: 'playeras',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
  },
  {
    name: 'Chamarra de mezclilla vintage',
    description: '[seed] Chamarra de mezclilla azul con lavado vintage, botones metálicos y bolsillos frontales, estilo workwear clásico.',
    price_mxn: 1200,
    category_slug: 'chamarra',
    image_url: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&q=80',
  },
  {
    name: 'Hoodie negro streetwear',
    description: '[seed] Hoodie negro con capucha amplia y bolsillo canguro, corte streetwear pesado para un look urbano.',
    price_mxn: 780,
    category_slug: 'hoodie',
    image_url: 'https://images.unsplash.com/photo-1565978771542-0e76f1a4f2e4?w=800&q=80',
  },
  {
    name: 'Playera negra básica',
    description: '[seed] Playera básica negra de cuello redondo, algodón suave y silueta recta, ideal para layering diario.',
    price_mxn: 380,
    category_slug: 'playeras',
    image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
  },
  {
    name: 'Pantalón cargo verde militar',
    description: '[seed] Pantalón cargo verde militar con bolsillos laterales utilitarios y corte recto, estética techwear funcional.',
    price_mxn: 950,
    category_slug: 'pants',
    image_url: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800&q=80',
  },
  {
    name: 'Camisa flannel a cuadros',
    description: '[seed] Camisa de franela con estampado de cuadros en tonos rojos y negros, tela cálida y caída relajada.',
    price_mxn: 680,
    category_slug: 'camisas',
    image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
  },
  {
    name: 'Sudadera crewneck gris',
    description: '[seed] Sudadera crewneck gris jaspeado, sin capucha, terry cepillado por dentro para máximo confort.',
    price_mxn: 720,
    category_slug: 'hoodie',
    image_url: 'https://images.unsplash.com/photo-1556821833-2e6a3e8c1e9c?w=800&q=80',
  },
  {
    name: 'Bomber negra clásica',
    description: '[seed] Bomber negra ligera con cierre frontal, puños y dobladillo en rib elástico, silueta clásica aviator.',
    price_mxn: 1400,
    category_slug: 'chamarra',
    image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
  },
  {
    name: 'Jeans baggy lavados',
    description: '[seed] Jeans baggy de mezclilla azul claro con lavado desgastado y pierna ancha, look noventero relajado.',
    price_mxn: 890,
    category_slug: 'jeans',
    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
  },
  {
    name: 'Polera vintage estampada',
    description: '[seed] Polera estilo vintage con estampado gráfico al frente, color crema envejecido y corte boxy.',
    price_mxn: 540,
    category_slug: 'playeras',
    image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
  },
  {
    name: 'Hoodie zip-up café',
    description: '[seed] Hoodie con cierre completo en color café chocolate, capucha forrada y bolsillos laterales discretos.',
    price_mxn: 820,
    category_slug: 'hoodie',
    image_url: 'https://images.unsplash.com/photo-1542272454315-7ad9f1b2a8c5?w=800&q=80',
  },
];

function toKebab(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function randSuffix(len = 4) {
  return Math.random().toString(36).slice(2, 2 + len);
}

async function verifyUrl(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function deletePreviousSeed() {
  const { data: prev, error } = await supabase
    .from('products')
    .select('id')
    .like('description', '[seed]%');

  if (error) {
    console.error('Error consultando seeds previos:', error.message);
    return;
  }
  if (!prev || prev.length === 0) {
    console.log('No hay seeds previos.');
    return;
  }
  const ids = prev.map((p) => p.id);
  console.log(`Borrando ${ids.length} seeds previos…`);

  await supabase.from('product_images').delete().in('product_id', ids);
  const { error: delErr } = await supabase.from('products').delete().in('id', ids);
  if (delErr) console.error('Error borrando productos previos:', delErr.message);
}

async function getCategoryMap(): Promise<Map<string, string>> {
  const { data, error } = await supabase.from('categories').select('id, slug');
  if (error) throw new Error('No pude leer categorías: ' + error.message);
  return new Map((data ?? []).map((c) => [c.slug, c.id]));
}

async function main() {
  console.log('VIOGI — Visual Search Seed\n');

  await deletePreviousSeed();
  const categoryMap = await getCategoryMap();

  let inserted = 0;
  let skipped = 0;
  let urlFailed = 0;

  for (let i = 0; i < SEED_PRODUCTS.length; i++) {
    const p = SEED_PRODUCTS[i];
    const tag = `[${i + 1}/${SEED_PRODUCTS.length}]`;

    const ok = await verifyUrl(p.image_url);
    if (!ok) {
      console.warn(`${tag} ⚠ URL falló: ${p.name}`);
      urlFailed++;
      skipped++;
      continue;
    }

    const categoryId = categoryMap.get(p.category_slug);
    if (!categoryId) {
      console.warn(`${tag} ⚠ Categoría '${p.category_slug}' no existe: ${p.name}`);
      skipped++;
      continue;
    }

    const slug = `${toKebab(p.name)}-${randSuffix()}`;

    const { data: product, error: insertErr } = await supabase
      .from('products')
      .insert({
        slug,
        name: p.name,
        description: p.description,
        price_mxn: p.price_mxn,
        category_id: categoryId,
      })
      .select('id')
      .single();

    if (insertErr || !product) {
      console.error(`${tag} ✗ Error insertando: ${p.name} — ${insertErr?.message}`);
      skipped++;
      continue;
    }

    const { error: imgErr } = await supabase.from('product_images').insert({
      product_id: product.id,
      url: p.image_url,
      is_primary: true,
      sort_order: 0,
    });

    if (imgErr) {
      console.error(`${tag} ✗ Error insertando imagen: ${p.name} — ${imgErr.message}`);
      skipped++;
      continue;
    }

    console.log(`${tag} ✓ ${p.name}`);
    inserted++;
  }

  console.log(`\nResumen: ${inserted} insertados / ${skipped} skipped (URLs falladas: ${urlFailed})`);

  if (urlFailed > 4) {
    console.warn('\n⚠ Más de 4 URLs fallaron. Considera reemplazarlas antes de generar embeddings.');
    process.exit(2);
  }
}

main().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
