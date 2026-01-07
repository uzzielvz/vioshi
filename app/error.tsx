"use client";

import { useEffect } from "react";
import { Button } from "@/components/common/Button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1">
        <div className="px-6 md:px-8 py-8 md:py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-2xl md:text-3xl font-normal mb-4 tracking-wide uppercase">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-600 mb-8">
              We're sorry, an error occurred. Please try again.
            </p>
            <Button onClick={reset}>Try Again</Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

