import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          <div>
            <h3 className="text-sm uppercase tracking-wide mb-4 font-normal">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/collections/all" className="hover:opacity-70 transition-opacity">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/collections/tees" className="hover:opacity-70 transition-opacity">
                  Tees
                </Link>
              </li>
              <li>
                <Link href="/collections/outerwear" className="hover:opacity-70 transition-opacity">
                  Outerwear
                </Link>
              </li>
              <li>
                <Link href="/collections/accessories" className="hover:opacity-70 transition-opacity">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm uppercase tracking-wide mb-4 font-normal">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/support" className="hover:opacity-70 transition-opacity">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:opacity-70 transition-opacity">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:opacity-70 transition-opacity">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="hover:opacity-70 transition-opacity">
                  Warranty
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm uppercase tracking-wide mb-4 font-normal">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal" className="hover:opacity-70 transition-opacity">
                  Legal
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:opacity-70 transition-opacity">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm uppercase tracking-wide mb-4 font-normal">Follow</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.instagram.com/viogi_/?hl=es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20 mt-12 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} VIOGI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
