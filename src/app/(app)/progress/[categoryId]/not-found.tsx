import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CategoryNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h1 className="text-xl font-semibold text-foreground mb-2">
        Category not found
      </h1>
      <p className="text-sm text-foreground-secondary mb-6 max-w-sm">
        This category does not exist or you do not have access to it.
      </p>
      <Link
        href="/progress"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background font-medium hover:bg-primary-hover transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Progress
      </Link>
    </div>
  );
}
