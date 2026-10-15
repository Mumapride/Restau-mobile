import React from "react";
import { Loader } from "lucide-react";

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-border ${className}`} />
);

const LoadingState = ({ lines = 4, message, height = "h-24" }) => (
  <div className="flex flex-col items-center justify-center py-12">
    {message && <p className="mb-4 text-sm font-medium text-text-secondary">{message}</p>}
    <div className="flex flex-col items-center gap-3">
      <Loader className="h-8 w-8 animate-spin text-primary" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={`${height} w-full max-w-sm`} />
        ))}
      </div>
    </div>
  </div>
);

export default LoadingState;
