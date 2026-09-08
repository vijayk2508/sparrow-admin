import React from "react";

/** A single pulsing gray block used while Firestore data loads. */
export const SkeletonPulse: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <div className={`animate-pulse bg-zinc-800/70 rounded-xl ${className || ""}`} style={style} />
);

const GRID_COLS: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

interface GridSkeletonProps {
  cols?: 2 | 3 | 4;
  count?: number;
  imageHeight?: number;
}

/** Full-section loading skeleton matching the dark card style across sections. */
export const GridSkeleton: React.FC<GridSkeletonProps> = ({ cols = 3, count = 6, imageHeight = 208 }) => {
  const colsCls = GRID_COLS[cols] || GRID_COLS[3];
  return (
    <div className={`grid grid-cols-1 ${colsCls} gap-8`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} imageHeight={imageHeight} />
      ))}
    </div>
  );
};

/** A single placeholder card used inline inside an existing grid container. */
export const SkeletonCard: React.FC<{ imageHeight?: number }> = ({ imageHeight = 208 }) => (
  <div className="bg-zinc-950/80 border border-zinc-800/70 rounded-2xl overflow-hidden">
    <SkeletonPulse style={{ height: imageHeight }} className="rounded-none" />
    <div className="p-6 space-y-3">
      <SkeletonPulse className="h-3 w-24" />
      <SkeletonPulse className="h-5 w-3/4" />
      <SkeletonPulse className="h-3 w-full" />
      <SkeletonPulse className="h-3 w-5/6" />
      <SkeletonPulse className="h-9 w-full mt-4" />
    </div>
  </div>
);

/** Small centered spinner used by the admin panel. */
export const Spinner: React.FC<{ label?: string }> = ({ label }) => (
  <div className="flex items-center justify-center gap-3 py-16 text-zinc-400">
    <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    {label && <span className="text-xs font-mono uppercase tracking-widest">{label}</span>}
  </div>
);