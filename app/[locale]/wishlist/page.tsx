import { getProducts } from '@/lib/products';
import WishlistContent from './WishlistContent';

export default async function WishlistPage() {
  const products = await getProducts();
  return <WishlistContent allProducts={products} />;
}
