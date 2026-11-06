import { redirect } from "next/navigation";

// There is no bag any more: a piece is bought from its page and more pieces of
// the same store are added while paying. Old links to /cart land there.
export default function CartPage({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/checkout`);
}
