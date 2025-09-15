export function AdBanner({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center w-full h-24 bg-muted border border-dashed rounded-lg my-8 ${className}`}
    >
      <span className="text-muted-foreground text-sm">Ad Placement</span>
    </div>
  );
}
