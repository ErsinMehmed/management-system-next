"use client";
import { useEffect, useState } from "react";
import { Button, Chip } from "@heroui/react";
import {
  FiDollarSign,
  FiCheckCircle,
  FiUser,
  FiShield,
  FiClock,
  FiFileText,
} from "react-icons/fi";
import Layout from "@/components/layout/Dashboard";
import { Skeleton, SkeletonListRow } from "@/components/Skeleton";
import { formatCurrency } from "@/utils";

const TYPE_FILTERS = [
  { key: "all", label: "Всички" },
  { key: "payout", label: "Изплащания" },
  { key: "revenue_confirmed", label: "Потвърден оборот" },
];

const formatDateTime = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleString("bg-BG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const groupByDay = (items) => {
  const map = new Map();
  for (const item of items) {
    const key = new Date(item.createdAt).toLocaleDateString("bg-BG", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return [...map.entries()];
};

const TypeBadge = ({ type }) => {
  const cfg =
    type === "payout"
      ? { label: "Изплащане", color: "bg-orange-100 text-orange-700", Icon: FiDollarSign }
      : { label: "Потвърден оборот", color: "bg-green-100 text-green-700", Icon: FiCheckCircle };
  return (
    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${cfg.color}`}>
      <cfg.Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

const AuditRow = ({ entry }) => {
  const isPayout = entry.type === "payout";
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
            <FiUser className="w-4 h-4 text-slate-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {entry.sellerName || "—"}
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <FiShield className="w-3 h-3" />
              <span className="truncate">от {entry.actorName || "—"}</span>
            </p>
          </div>
        </div>
        <TypeBadge type={entry.type} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Оборот
          </p>
          <p className="text-sm font-bold text-slate-800 tabular-nums">
            {formatCurrency(entry.revenue, 2)}
          </p>
        </div>

        {isPayout && (
          <div>
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-0.5">
              Изплатено
            </p>
            <p className="text-sm font-bold text-orange-600 tabular-nums">
              {formatCurrency(entry.payout, 2)}
            </p>
          </div>
        )}

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Поръчки
          </p>
          <p className="text-sm font-bold text-slate-800 tabular-nums">
            {entry.orderCount}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Кога
          </p>
          <p className="text-sm font-semibold text-slate-700 tabular-nums">
            {formatDateTime(entry.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function AuditClient() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchPage = async (p, type) => {
    const params = new URLSearchParams({ page: String(p), per_page: "20" });
    if (type && type !== "all") params.set("type", type);
    const res = await fetch(`/api/payment-audit?${params}`);
    return res.json();
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(1);
    fetchPage(1, typeFilter)
      .then((data) => {
        if (cancelled) return;
        setItems(data.items || []);
        setHasMore((data.pagination?.total_pages ?? 1) > 1);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [typeFilter]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = page + 1;
    try {
      const data = await fetchPage(next, typeFilter);
      setItems((prev) => [...prev, ...(data.items || [])]);
      setPage(next);
      setHasMore(next < (data.pagination?.total_pages ?? 1));
    } finally {
      setLoadingMore(false);
    }
  };

  const totalRevenue = items.reduce((s, x) => s + (x.revenue || 0), 0);
  const totalPayout = items
    .filter((x) => x.type === "payout")
    .reduce((s, x) => s + (x.payout || 0), 0);
  const grouped = groupByDay(items);

  return (
    <Layout
      title="Одит на плащания"
      breadcrumb={[{ label: "Одит на плащания", current: true }]}>
      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {TYPE_FILTERS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            radius="full"
            variant={typeFilter === f.key ? "solid" : "flat"}
            color={typeFilter === f.key ? "primary" : "default"}
            onPress={() => setTypeFilter(f.key)}
            className={`font-semibold text-xs ${
              typeFilter !== f.key ? "text-slate-500" : ""
            }`}>
            {f.label}
          </Button>
        ))}
      </div>

      {/* Summary cards — само за първата страница на текущия филтър */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-3 py-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <FiFileText className="w-4 h-4 text-slate-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Действия
              </p>
              <p className="text-base font-bold text-slate-700 tabular-nums">
                {items.length}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-3 py-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <FiDollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                Сумарен оборот
              </p>
              <p className="text-sm font-bold text-emerald-700 tabular-nums truncate">
                {formatCurrency(totalRevenue, 2)}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 px-3 py-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <FiCheckCircle className="w-4 h-4 text-orange-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                Изплатено
              </p>
              <p className="text-sm font-bold text-orange-600 tabular-nums truncate">
                {formatCurrency(totalPayout, 2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonListRow key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-1">
            <FiClock className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-400">
            Няма записани действия
          </p>
          <p className="text-xs text-slate-300">
            Тук ще се появят изплащания и потвърждения на оборот.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {grouped.map(([day, entries]) => (
            <div key={day} className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {day}
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full tabular-nums">
                  {entries.length}
                </span>
                <div className="flex-1 h-px bg-slate-200/80" />
              </div>
              {entries.map((entry) => (
                <AuditRow key={entry._id} entry={entry} />
              ))}
            </div>
          ))}

          {hasMore && (
            <div className="flex justify-center mt-2">
              <Button
                size="sm"
                variant="flat"
                radius="full"
                isLoading={loadingMore}
                onPress={loadMore}
                className="font-semibold">
                Зареди още
              </Button>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
