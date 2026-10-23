import { notFound } from 'next/navigation';

// Unknown paths under a locale render [locale]/not-found.tsx (with the shell
// and translations) instead of the bare root 404.
export default function CatchAll() {
  notFound();
}
