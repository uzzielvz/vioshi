import type { MetadataRoute } from 'next';
import { brand } from '@/lib/brand';

// Makes the store installable as an app (home screen icon, full screen).
export default function manifest(): MetadataRoute.Manifest {
  const name = brand.name.toLowerCase();
  return {
    name,
    short_name: name,
    description: brand.descriptionDefault,
    id: '/',
    start_url: '/es',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FFFFFF',
    theme_color: '#FFFFFF',
    lang: 'es-MX',
    categories: ['shopping', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
