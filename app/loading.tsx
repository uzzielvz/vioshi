import { Spinner } from "@/components/common/Spinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  );
}

