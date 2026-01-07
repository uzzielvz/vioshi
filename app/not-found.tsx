import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1">
        <div className="px-6 md:px-8 py-8 md:py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-normal mb-4 tracking-wide uppercase">
                404
              </h1>
              <p className="text-sm text-gray-600 mb-8">Page not found</p>
              <Link
                href="/"
                className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors inline-block text-sm uppercase tracking-wide"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
