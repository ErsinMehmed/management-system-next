// Унифициран skeleton primitive. По подразбиране bg-slate-100 + animate-pulse;
// размер/форма се задават през className. Всички tab-ове ползват тази
// форма за да усеща loading-ът еднакво.
export const Skeleton = ({ className = "", style }) => (
  <div className={`bg-slate-100 rounded-lg animate-pulse ${className}`} style={style} />
);

// KPI card placeholder — иконка вляво + 2 реда текст
export const SkeletonKpiCard = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3.5 flex items-center gap-3">
    <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
    <div className="flex flex-col gap-2 flex-1">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
);

// Ред в списък — лява иконка + 2 реда текст + дясна цифра
export const SkeletonListRow = () => (
  <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 last:border-0 gap-3">
    <div className="flex items-center gap-2.5 min-w-0 flex-1">
      <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <Skeleton className="h-3.5 w-28 max-w-full" />
        <Skeleton className="h-3 w-40 max-w-full" />
      </div>
    </div>
    <Skeleton className="h-4 w-16 shrink-0" />
  </div>
);
