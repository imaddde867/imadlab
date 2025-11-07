const RunningPageSkeleton = () => {
  return (
    <div className="space-y-24 animate-pulse">
      {/* Stats Grid Skeleton */}
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="h-8 w-64 bg-white/5 rounded"></div>

        {/* Featured stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-8 h-56">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
                <div className="h-6 w-20 bg-white/5 rounded-full"></div>
              </div>
              <div className="h-12 w-24 bg-white/10 rounded mb-2"></div>
              <div className="h-4 w-32 bg-white/5 rounded"></div>
            </div>
          ))}
        </div>

        {/* All-time stats skeleton */}
        <div className="mt-12">
          <div className="h-8 w-64 bg-white/5 rounded mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-6 h-32">
                <div className="h-4 w-24 bg-white/10 rounded mb-4"></div>
                <div className="h-8 w-16 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="space-y-8">
        <div className="h-8 w-48 bg-white/5 rounded"></div>
        <div className="h-64 bg-white/5 border border-white/10 rounded-lg"></div>
      </div>

      {/* Activities Skeleton */}
      <div className="space-y-6">
        <div className="h-8 w-56 bg-white/5 rounded"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-6 h-64">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-6 w-48 bg-white/10 rounded mb-2"></div>
                <div className="h-4 w-32 bg-white/5 rounded"></div>
              </div>
              <div className="h-10 w-32 bg-white/10 rounded-lg"></div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-6">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="bg-white/5 rounded-lg p-4 h-20">
                  <div className="h-3 w-16 bg-white/10 rounded mb-2"></div>
                  <div className="h-6 w-12 bg-white/10 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RunningPageSkeleton;
