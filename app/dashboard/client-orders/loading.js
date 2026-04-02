export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#0071f5] border-t-transparent animate-spin" />
        <span className="text-sm text-slate-400 font-medium">Зареждане...</span>
      </div>
    </div>
  );
}
