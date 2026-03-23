import { FiEdit2 } from "react-icons/fi";
import { Button } from "@heroui/react";
import { formatCurrency } from "@/utils";

function MetricCard({ label, value, variant = "default" }) {
  const styles = {
    default: { card: "border-white/80", label: "text-slate-400", value: "text-slate-800" },
    accent:  { card: "border-white/80", label: "text-slate-400", value: "text-[#0071f5]" },
    orange:  { card: "border-orange-100", label: "text-orange-400", value: "text-orange-500" },
  };
  const s = styles[variant];
  return (
    <div className={`bg-white rounded-lg px-3 py-2 flex flex-col items-center shadow-sm border min-w-[72px] ${s.card}`}>
      <span className={`text-xs font-medium ${s.label}`}>{label}</span>
      <span className={`text-lg font-bold ${s.value}`}>{value}</span>
    </div>
  );
}

export default function OrderProductCard({
  productName,
  secondProductName,
  currentQuantity,
  currentQuantity2,
  currentPrice,
  currentPrice2,
  currentPayout,
  isSuperAdmin,
  canEdit,
  onEdit,
}) {
  const totalPrice = currentPrice + currentPrice2;

  return (
    <div className="mx-4 mb-4 rounded-xl p-4 bg-slate-50 border border-slate-100">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-base font-bold text-slate-800 leading-snug">{productName}</p>
            {currentPrice2 > 0 && (
              <span className="text-sm font-bold text-slate-600">{formatCurrency(currentPrice, 2)}</span>
            )}
          </div>
          {secondProductName && (
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">+</span>
                <p className="text-sm font-semibold text-slate-600 leading-snug">{secondProductName}</p>
                <span className="text-xs font-medium text-slate-400">× {currentQuantity2} бр.</span>
              </div>
              {currentPrice2 > 0 && (
                <span className="text-sm font-bold text-[#0071f5]">{formatCurrency(currentPrice2, 2)}</span>
              )}
            </div>
          )}
        </div>

        {canEdit && (
          <Button
            size="sm"
            variant="outline"
            onPress={onEdit}
            className="font-semibold shrink-0 rounded-lg bg-white text-[#0071f5] border border-blue-100 shadow-sm">
            <FiEdit2 className="w-3.5 h-3.5" />
            Редактирай
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <MetricCard label="Бройки" value={currentQuantity} />
        <MetricCard
          label={currentPrice2 > 0 ? "Обща цена" : "Цена"}
          value={formatCurrency(totalPrice, 2)}
          variant="accent"
        />
        {isSuperAdmin && (
          <MetricCard label="За изплащане" value={formatCurrency(currentPayout, 2)} variant="orange" />
        )}
      </div>
    </div>
  );
}
