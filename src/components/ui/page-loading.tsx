/**
 * Shared fallback for Suspense and route loading.tsx.
 * Keeps loading UI consistent and avoids layout shift.
 */
export function PageLoadingFallback() {
  return (
    <div
      className="text-muted-foreground flex min-h-[200px] items-center justify-center"
      aria-label="Loading"
    >
      <span className="inline-block size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
    </div>
  );
}
