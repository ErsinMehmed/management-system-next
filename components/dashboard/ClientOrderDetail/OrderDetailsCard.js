import { FiMapPin, FiFileText, FiUser, FiAlertCircle, FiTruck, FiEye, FiEyeOff, FiDollarSign } from "react-icons/fi";
import { formatCurrency } from "@/utils";

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 px-5 py-3.5">
      <span className="w-4 h-4 text-slate-400 mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ active, activeIcon, inactiveIcon, activeLabel, inactiveLabel }) {
  return (
    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
      {active ? activeIcon : inactiveIcon}
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

export default function OrderDetailsCard({ order, currentRejectionReason, viewed, isSuperAdmin }) {
  const hasContent = order.address || order.note || currentRejectionReason || order.assignedTo?.name || isSuperAdmin;
  if (!hasContent) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
      {order.address && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group">
          <FiMapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0 group-hover:text-[#0071f5] transition-colors" />
          <div>
            <p className="text-xs text-slate-400 font-medium mb-0.5">Адрес</p>
            <p className="text-sm font-medium text-slate-700 group-hover:text-[#0071f5] transition-colors">{order.address}</p>
          </div>
        </a>
      )}

      {order.note && (
        <DetailRow icon={<FiFileText className="w-4 h-4" />} label="Бележка" value={order.note} />
      )}

      {order.deliveryCost > 0 && (
        <div className="flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <FiTruck className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Доставка</p>
              <p className="text-sm font-medium text-slate-700">Допълнителна доставка</p>
            </div>
          </div>
          <span className="text-sm font-bold text-[#0071f5]">{formatCurrency(order.deliveryCost, 2)}</span>
        </div>
      )}

      {currentRejectionReason && (
        <div className="flex items-start gap-3 px-5 py-3.5">
          <FiAlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-red-400 font-medium mb-0.5">Причина за отказ</p>
            <p className="text-sm font-medium text-slate-700">{currentRejectionReason}</p>
          </div>
        </div>
      )}

      {isSuperAdmin && order.distributorPayout > 0 && (
        <div className="flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <FiDollarSign className="w-4 h-4 text-orange-400 shrink-0" />
            <div>
              <p className="text-xs text-orange-400 font-medium mb-0.5">Хонорар дистрибутор</p>
              <p className="text-sm font-medium text-slate-700">За изплащане на дистрибутор</p>
            </div>
          </div>
          <span className="text-sm font-bold text-orange-500">{formatCurrency(order.distributorPayout, 2)}</span>
        </div>
      )}

      {order.assignedTo?.name && (
        <div className="flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <FiUser className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Доставчик</p>
              <p className="text-sm font-medium text-slate-700">{order.assignedTo.name}</p>
            </div>
          </div>
          {isSuperAdmin && (
            <div className="flex items-center gap-2">
              <StatusBadge
                active={viewed}
                activeIcon={<FiEye className="w-3.5 h-3.5" />}
                inactiveIcon={<FiEyeOff className="w-3.5 h-3.5" />}
                activeLabel="Видяна"
                inactiveLabel="Не е видяна"
              />
              <StatusBadge
                active={order.isPaid}
                activeLabel="Изплатена"
                inactiveLabel="Неизплатена"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
