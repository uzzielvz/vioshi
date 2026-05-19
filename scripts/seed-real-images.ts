/**
 * VIOGI — Seed con imágenes reales del usuario
 *
 * - Borra todos los seeds previos (description like '[seed]%')
 * - Sube cada imagen local al bucket 'product-images' de Supabase Storage
 * - Inserta producto + product_image con la URL pública
 * - Deja embedding en NULL (lo procesa generate-embeddings.ts después)
 *
 * Uso: npx tsx scripts/seed-real-images.ts
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, extname } from 'path';
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
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

const ASSETS_DIR =
  'C:\\Users\\uzzie\\.cursor\\projects\\c-Users-uzzie-Documents-viogi-dot-comm\\assets';
const FILE_PREFIX =
  'c__Users_uzzie_AppData_Roaming_Cursor_User_workspaceStorage_8e53b9bc964a2b8c53fe591f0cb67eb1_images_image-';
const BUCKET = 'product-images';

type Seed = {
  uuid_part: string;
  name: string;
  description: string;
  category_slug: string;
  price_mxn: number;
};

const SEEDS: Seed[] = [
  {
    uuid_part: '076c437b-7377-43a4-8b39-782bb74685a3',
    name: 'Jersey Selección Alemana 2008',
    description:
      '[seed] Jersey vintage de la selección alemana de fútbol 2008 (Adidas), color rojo intenso con paneles negros laterales, escudo bordado al frente y tres estrellas doradas. Manga corta, talla S.',
    category_slug: 'playeras',
    price_mxn: 200,
  },
  {
    uuid_part: '6fa3be90-7828-4e7e-b0f8-d5cd4fec7946',
    name: 'Tee Nike DUNKAHOLIC Dri-FIT',
    description:
      '[seed] Playera Nike Dri-FIT negra con estampado central "DUNKAHOLIC" en letras blancas y swoosh. Corte regular con caída relajada. Talla XL.',
    category_slug: 'playeras',
    price_mxn: 200,
  },
  {
    uuid_part: 'd2be414a-b8bf-420b-a58b-3cfc07ee24ea',
    name: 'Crewneck GAP Full Red',
    description:
      '[seed] Sudadera crewneck GAP en color rojo monocromático con logo GAP en burdeos al frente, corte oversized y terry suave por dentro. Talla XL.',
    category_slug: 'hoodie',
    price_mxn: 300,
  },
  {
    uuid_part: '9856d095-ef4f-4b94-abfe-54f447ed059c',
    name: 'Tee Vultures Germanian Eagle by Ye',
    description:
      '[seed] Playera negra de algodón pesado tipo box-fit con estampado del águila Vultures (Germanian Eagle) en gris desgastado al centro de la espalda. Talla L.',
    category_slug: 'playeras',
    price_mxn: 700,
  },
  {
    uuid_part: 'f436157b-1da9-42e9-afa2-f2330adafeb9',
    name: 'Rompevientos Vintage Adidas',
    description:
      '[seed] Rompevientos vintage Adidas color azul marino con panel pecho/hombros blanco y tres rayas rojas en mangas. Cierre frontal completo, cuello alto, puños elásticos. Talla L.',
    category_slug: 'chamarra',
    price_mxn: 500,
  },
  {
    uuid_part: '36558a53-0819-4ca1-ac0b-c47c8ff19783',
    name: "Trucker Vintage Levi's Sherpa",
    description:
      "[seed] Chamarra trucker Levi's de mezclilla azul medio con interior y cuello forrados en sherpa color crema. Botones metálicos, bolsillos pecho y costuras contrastantes. Talla L.",
    category_slug: 'chamarra',
    price_mxn: 700,
  },
  {
    uuid_part: 'ffd0b008-8932-4e28-932d-bbe2e665dc9f',
    name: 'Carhartt Detroit Jacket Black Duke',
    description:
      '[seed] Chamarra Carhartt Detroit en negro envejecido con cuello tipo cordobán café, parche de marca al frente y bolsillos utilitarios. Tela canvas duck pesada. Talla L.',
    category_slug: 'chamarra',
    price_mxn: 1200,
  },
  {
    uuid_part: '26432780-fb21-480a-849d-0f9c85066117',
    name: 'Jeans FILA Baggy Lavados',
    description:
      '[seed] Jeans baggy FILA en mezclilla azul claro con lavado acid y parche FILA en bolsillo trasero. Corte holgado pierna ancha, look noventero. Talla 32×32.',
    category_slug: 'jeans',
    price_mxn: 300,
  },
  {
    uuid_part: '68b88991-5852-4d02-b3f1-45e841450326',
    name: 'Track Pants Nike Negros',
    description:
      '[seed] Pantalón deportivo Nike negro de tela ligera nylon con vivos blancos laterales y swoosh, cintura elástica con cordón. Corte recto y caída fluida.',
    category_slug: 'pants',
    price_mxn: 250,
  },
  {
    uuid_part: 'e80ada4a-44ca-46c3-8412-da9612ad607d',
    name: 'Track Jacket Nike Rojo',
    description:
      '[seed] Track jacket Nike rojo con paneles blancos en hombros, cierre completo, cuello alto y swoosh blanco al pecho. Puños y dobladillo en rib elástico.',
    category_slug: 'chamarra',
    price_mxn: 450,
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

async function deletePreviousSeed() {
  const { data: prev, error } = await supabase
    .from('products')
    .select('id')
    .like('description', '[seed]%');

  if (error) {
    throw new Error('Error consultando seeds previos: ' + error.message);
  }
  if (!prev || prev.length === 0) {
    console.log('No hay seeds previos.\n');
    return;
  }
  const ids = prev.map((p) => p.id);
  console.log(`Borrando ${ids.length} seeds previos…`);

  await supabase.from('product_images').delete().in('product_id', ids);
  const { error: delErr } = await supabase.from('products').delete().in('id', ids);
  if (delErr) console.error('Error borrando productos:', delErr.message);
  console.log('Seeds previos borrados.\n');
}

async function getCategoryMap(): Promise<Map<string, string>> {
  const { data, error } = await supabase.from('categories').select('id, slug');
  if (error) throw new Error('No pude leer categorías: ' + error.message);
  return new Map((data ?? []).map((c) => [c.slug, c.id]));
}

async function ensureBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.warn('No pude listar buckets:', error.message);
    return;
  }
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    console.log(`Bucket '${BUCKET}' no existe. Creándolo como público…`);
    const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
      public: true,
    });
    if (createErr) {
      throw new Error(`No pude crear bucket: ${createErr.message}`);
    }
    console.log(`Bucket '${BUCKET}' creado.\n`);
  } else {
    console.log(`Bucket '${BUCKET}' ya existe.\n`);
  }
}

async function uploadImage(seed: Seed): Promise<string | null> {
  const filename = `${FILE_PREFIX}${seed.uuid_part}.png`;
  const fullPath = `${ASSETS_DIR}\\${filename}`;

  if (!existsSync(fullPath)) {
    console.warn(`  ⚠ Archivo no existe: ${filename}`);
    return null;
  }

  const buffer = readFileSync(fullPath);
  const ext = extname(filename).slice(1) || 'png';
  const storagePath = `seed/${toKebab(seed.name)}-${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: 'image/png',
      upsert: false,
    });

  if (uploadErr) {
    console.error(`  ✗ Upload falló: ${uploadErr.message}`);
    return null;
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return urlData.publicUrl;
}

async function main() {
  console.log('VIOGI — Seed con imágenes reales\n');

  await ensureBucket();
  await deletePreviousSeed();
  const categoryMap = await getCategoryMap();

  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < SEEDS.length; i++) {
    const seed = SEEDS[i];
    const tag = `[${i + 1}/${SEEDS.length}]`;
    console.log(`${tag} ${seed.name}`);

    const categoryId = categoryMap.get(seed.category_slug);
    if (!categoryId) {
      console.warn(`  ⚠ Categoría '${seed.category_slug}' no existe — skip`);
      skipped++;
      continue;
    }

    const imageUrl = await uploadImage(seed);
    if (!imageUrl) {
      skipped++;
      continue;
    }

    const slug = `${toKebab(seed.name)}-${randSuffix()}`;

    const { data: product, error: insertErr } = await supabase
      .from('products')
      .insert({
        slug,
        name: seed.name,
        description: seed.description,
        price_mxn: seed.price_mxn,
        category_id: categoryId,
      })
      .select('id')
      .single();

    if (insertErr || !product) {
      console.error(`  ✗ Insert product: ${insertErr?.message}`);
      skipped++;
      continue;
    }

    const { error: imgErr } = await supabase.from('product_images').insert({
      product_id: product.id,
      url: imageUrl,
      is_primary: true,
      sort_order: 0,
    });

    if (imgErr) {
      console.error(`  ✗ Insert product_image: ${imgErr.message}`);
      skipped++;
      continue;
    }

    console.log(`  ✓ Subida: ${imageUrl.slice(0, 80)}…`);
    inserted++;
  }

  console.log(`\nResumen: ${inserted} insertados / ${skipped} skipped`);
  console.log('\nSiguiente paso: npx tsx scripts/generate-embeddings.ts');
}

main().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
