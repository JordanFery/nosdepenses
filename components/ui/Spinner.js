export function Spinner({ className = "" }) {
  return (
    <div className={`flex items-center justify-center py-10 ${className}`}>
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
    </div>
  );
}

export function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-neutral-200/70 ${className}`} />;
}
