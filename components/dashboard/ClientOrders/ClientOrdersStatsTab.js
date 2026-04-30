"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Spinner, Button } from "@heroui/react";
import {
  FiArrowUp, FiArrowDown, FiMinus, FiDollarSign, FiTrendingUp,
  FiShoppingBag, FiUsers, FiClock, FiPackage,
  FiFilter, FiAward,
} from "react-icons/fi";
import { TbMoneybag } from "react-icons/tb";
import { formatCurrency, productTitle } from "@/utils";
import ClientProfileModal from "@/components/dashboard/ClientOrders/ClientProfileModal";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const presets = [
  { key: "today", label: "Днес" },
  { key: "yesterday", label: "Вчера" },
  { key: "week", label: "Тази седмица" },
  { key: "month", label: "Този месец" },
  { key: "quarter", label: "Тримесечие" },
  { key: "year", label: "Тази година" },
];

const getQuarterRange = (q) => {
  const now = new Date();
  const currQ = Math.floor(now.getMonth() / 3) + 1;
  const startMonth = (q - 1) * 3;
  const from = new Date(now.getFullYear(), startMonth, 1);
  const to = q < currQ ? new Date(now.getFullYear(), startMonth + 3, 0) : now;
  return { from: fmt(from), to: fmt(to) };
};

const getPresetRange = (key, opts = {}) => {
  const now = new Date();
  if (key === "today") {
    return { from: fmt(now), to: fmt(now) };
  }
  if (key === "yesterday") {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    return { from: fmt(y), to: fmt(y) };
  }
  if (key === "week") {
    const day = now.getDay() || 7;
    const from = new Date(now); from.setDate(now.getDate() - day + 1);
    return { from: fmt(from), to: fmt(now) };
  }
  if (key === "month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: fmt(from), to: fmt(now) };
  }
  if (key === "quarter") {
    const currQ = Math.floor(now.getMonth() / 3) + 1;
    return getQuarterRange(opts.quarter ?? currQ);
  }
  // year
  const from = new Date(now.getFullYear(), 0, 1);
  return { from: fmt(from), to: fmt(now) };
};

const pct = (a, b) => {
  if (!b) return a === 0 ? 0 : a > 0 ? 100 : -100;
  return ((a - b) / Math.abs(b)) * 100;
};

const formatShortDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return `${String(dt.getDate()).padStart(2, "0")}.${String(dt.getMonth() + 1).padStart(2, "0")}.${dt.getFullYear()}`;
};

const KpiCard = ({ label, icon: Icon, curr, prev, fmt: fmtVal, gradient, invertColors = false }) => {
  const change = pct(curr, prev);
  const isUp = change > 0;
  const good = invertColors ? !isUp : isUp;
  const trendColor = change === 0 ? "slate" : good ? "emerald" : "rose";
  const Arrow = change === 0 ? FiMinus : isUp ? FiArrowUp : FiArrowDown;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2.5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <p className="text-xl font-bold text-slate-800 tabular-nums leading-tight">{fmtVal(curr)}</p>
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-${trendColor}-50 text-${trendColor}-600`}>
          <Arrow className="w-2.5 h-2.5" />
          <span className="tabular-nums">{Math.abs(change).toFixed(1)}%</span>
        </div>
        <span className="text-[10px] text-slate-400 truncate">преди: <span className="tabular-nums font-semibold text-slate-600">{fmtVal(prev)}</span></span>
      </div>
    </div>
  );
};

const SectionCard = ({ title, subtitle, icon: Icon, gradient, children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}>
    <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
      {Icon && (
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient || "from-slate-500 to-slate-600"} flex items-center justify-center shrink-0`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">{title}</p>
        {subtitle && <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const currentQuarter = () => Math.floor(new Date().getMonth() / 3) + 1;

const ClientOrdersStatsTab = () => {
  const [activePreset, setActivePreset] = useState("month");
  const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter());
  const [range, setRange] = useState(getPresetRange("month"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePhone, setProfilePhone] = useState(null);
  const [chartMetric, setChartMetric] = useState("revenue");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(range);
    fetch(`/api/client-orders/analytics?${params}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [range]);

  const aggregatedSeries = useMemo(() => {
    if (!data?.series?.length) return [];
    const bucket = activePreset === "year" ? 14 : activePreset === "quarter" ? 7 : null;
    if (!bucket) return data.series;
    const result = [];
    for (let i = 0; i < data.series.length; i += bucket) {
      const chunk = data.series.slice(i, i + bucket);
      const sum = chunk.reduce(
        (a, c) => ({
          revenue: a.revenue + (c.revenue || 0),
          profit: a.profit + (c.profit || 0),
          orders: a.orders + (c.orders || 0),
        }),
        { revenue: 0, profit: 0, orders: 0 }
      );
      result.push({
        date: chunk[0].date,
        endDate: chunk[chunk.length - 1].date,
        ...sum,
      });
    }
    return result;
  }, [data, activePreset]);

  const trendOptions = useMemo(() => {
    const m = !data?.isAdmin && chartMetric === "profit" ? "revenue" : chartMetric;
    return {
      chart: { type: "area", fontFamily: "Inter, sans-serif", toolbar: { show: false }, zoom: { enabled: false } },
      stroke: { curve: "smooth", width: 2.5 },
      colors: m === "profit" ? ["#10b981"] : m === "orders" ? ["#f59e0b"] : ["#6366f1"],
      fill: {
        type: "gradient",
        gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0, stops: [0, 100] },
      },
      xaxis: {
        categories: aggregatedSeries.map((s) => {
          const [, mo, dd] = s.date.split("-");
          if (s.endDate && s.endDate !== s.date) {
            const [, eMo, eDd] = s.endDate.split("-");
            return `${dd}.${mo}–${eDd}.${eMo}`;
          }
          return `${dd}.${mo}`;
        }),
        labels: { style: { fontSize: "10px", colors: "#94a3b8" } },
      },
      yaxis: {
        labels: {
          formatter: (v) => m === "orders" ? Math.round(v) : formatCurrency(v, 0),
          style: { fontSize: "10px", colors: "#94a3b8" }
        },
      },
      grid: { borderColor: "#f1f5f9" },
      tooltip: {
        shared: true,
        y: { formatter: (v) => m === "orders" ? `${v} поръчки` : formatCurrency(v, 2) },
      },
      legend: { show: false },
    };
  }, [data, chartMetric, aggregatedSeries]);

  const trendSeries = useMemo(() => {
    if (!aggregatedSeries.length) return [];
    const m = !data?.isAdmin && chartMetric === "profit" ? "revenue" : chartMetric;
    const label = m === "profit" ? "Печалба" : m === "orders" ? "Поръчки" : "Приходи";
    return [{ name: label, data: aggregatedSeries.map((s) => s[m] ?? 0) }];
  }, [data, chartMetric, aggregatedSeries]);

  const applyPreset = (key) => {
    setActivePreset(key);
    if (key === "quarter") {
      setRange(getPresetRange("quarter", { quarter: selectedQuarter }));
    } else {
      setRange(getPresetRange(key));
    }
  };

  const applyQuarter = (q) => {
    setSelectedQuarter(q);
    setActivePreset("quarter");
    setRange(getQuarterRange(q));
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const k = data.kpi || {};
  const kp = data.kpiPrev || {};
  const pointsCount = Math.max(aggregatedSeries.length, 1);
  const chartMinWidth = pointsCount * 55;
  const canSeeProfit = !!data.isAdmin;
  const effectiveMetric = !canSeeProfit && chartMetric === "profit" ? "revenue" : chartMetric;

  return (
    <>
      {/* Period filter */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 mb-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 mr-2">
            <FiFilter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">Период</span>
          </div>
          {presets.map((p) => (
            <Button
              key={p.key}
              size="sm"
              radius="full"
              variant={activePreset === p.key ? "solid" : "flat"}
              color={activePreset === p.key ? "primary" : "default"}
              onPress={() => applyPreset(p.key)}
            >
              {p.label}
            </Button>
          ))}
        </div>
        {activePreset === "quarter" && (
          <div className="flex items-center gap-1.5 flex-wrap pl-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Тримесечие:</span>
            {Array.from({ length: currentQuarter() }, (_, i) => i + 1).map((q) => (
              <button
                key={q}
                onClick={() => applyQuarter(q)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
                  selectedQuarter === q
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-400 hover:text-indigo-600"
                }`}
              >
                Q{q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* KPI хедър */}
      <div className={`grid grid-cols-2 ${canSeeProfit ? "lg:grid-cols-4" : "lg:grid-cols-2"} gap-3 mb-4`}>
        <KpiCard label="Поръчки" icon={FiShoppingBag}
          curr={k.orders} prev={kp.orders}
          fmt={(v) => v?.toLocaleString?.("bg-BG") || 0}
          gradient="from-amber-500 to-orange-500" />
        <KpiCard label="Приходи" icon={FiDollarSign}
          curr={k.revenue} prev={kp.revenue}
          fmt={(v) => formatCurrency(v || 0, 2)}
          gradient="from-indigo-500 to-violet-500" />
        {canSeeProfit && (
          <>
            <KpiCard label="Печалба" icon={TbMoneybag}
              curr={k.profit} prev={kp.profit}
              fmt={(v) => formatCurrency(v || 0, 2)}
              gradient="from-emerald-500 to-teal-500" />
            <KpiCard label="Марж %" icon={FiTrendingUp}
              curr={(k.margin || 0) * 100} prev={(kp.margin || 0) * 100}
              fmt={(v) => `${(v || 0).toFixed(1)}%`}
              gradient="from-rose-500 to-pink-500" />
          </>
        )}
      </div>

      {(() => {
        const isShortRange = activePreset === "today" || activePreset === "yesterday";

        const sellersCard = (
          <SectionCard
            title="Доставчици"
            subtitle={`${data.sellers.length} активни`}
            icon={FiUsers}
            gradient="from-blue-500 to-cyan-500"
          >
            {data.sellers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">Няма доставени поръчки</div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {data.sellers.map((s, i) => {
                  const fullyPaid = s.payout > 0 && s.paidPayout >= s.payout;
                  return (
                    <li key={s._id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50/60">
                      <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{s.name || "—"}</p>
                        <p className="text-[11px] text-slate-400 tabular-nums truncate">
                          {s.orders} поръчки · комисионна{" "}
                          <span className={fullyPaid ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                            {formatCurrency(s.payout, 2)}
                          </span>
                        </p>
                      </div>
                      <span className="text-sm font-bold text-indigo-600 tabular-nums shrink-0 whitespace-nowrap">
                        {formatCurrency(s.revenue, 2)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        );

        const productsCard = (
          <SectionCard
            title="Топ продукти"
            subtitle="по приходи"
            icon={FiPackage}
            gradient="from-amber-500 to-orange-500"
          >
            {data.products.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">Няма продажби</div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {data.products.map((p, i) => (
                  <li key={p._id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50/60">
                    <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{productTitle(p)}</p>
                      <p className="text-[11px] text-slate-400 tabular-nums">
                        {p.qty} бр. · {p.orders} поръчки{canSeeProfit ? ` · марж ${((p.margin || 0) * 100).toFixed(0)}%` : ""}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-indigo-600 tabular-nums shrink-0 whitespace-nowrap">
                      {formatCurrency(p.revenue, 2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        );

        const clientsCard = (
          <SectionCard
            title="Топ клиенти"
            subtitle={`${data.kpi.uniqueClients} уникални за периода`}
            icon={FiAward}
            gradient="from-violet-500 to-purple-500"
          >
            {data.clients.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">Няма клиенти</div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {data.clients.map((cl, i) => {
                  const aov = cl.orders > 0 ? cl.revenue / cl.orders : 0;
                  return (
                    <li
                      key={cl.phone}
                      onClick={() => setProfilePhone(cl.phone)}
                      className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50/60 cursor-pointer transition-colors"
                    >
                      <span className="w-5 h-5 rounded-md bg-violet-50 text-violet-600 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">
                          {cl.name || <span className="tabular-nums">{cl.phone}</span>}
                        </p>
                        <p className="text-[11px] text-slate-400 tabular-nums truncate">
                          {cl.name ? `${cl.phone} · ` : ""}{cl.orders} поръчки · ср. {formatCurrency(aov, 2)}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-indigo-600 tabular-nums shrink-0 whitespace-nowrap">
                        {formatCurrency(cl.revenue, 2)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        );

        const trendCard = (
          <SectionCard
            title="Тенденция по време"
            subtitle={`${formatShortDate(range.from)} – ${formatShortDate(range.to)}`}
            icon={FiTrendingUp}
            gradient="from-indigo-500 to-violet-500"
          >
            <div className="px-5 pt-3 flex items-center gap-1.5 flex-wrap">
              {[
                { key: "revenue", label: "Приходи", show: true },
                { key: "profit", label: "Печалба", show: canSeeProfit },
                { key: "orders", label: "Поръчки", show: true },
              ].filter((m) => m.show).map((m) => (
                <button
                  key={m.key}
                  onClick={() => setChartMetric(m.key)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
                    effectiveMetric === m.key
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-400 hover:text-indigo-600"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto sm:overflow-visible -mx-0 px-1 pb-1">
              <div className="sm:min-w-0!" style={{ minWidth: chartMinWidth }}>
                <ReactApexChart type="area" options={trendOptions} series={trendSeries} height={260} />
              </div>
            </div>
          </SectionCard>
        );

        if (isShortRange) {
          return (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_2fr] gap-3 mb-4">
              {sellersCard}
              {productsCard}
              {clientsCard}
            </div>
          );
        }

        return (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_4fr] gap-3 mb-4">
              {sellersCard}
              {trendCard}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
              {productsCard}
              {clientsCard}
            </div>
          </>
        );
      })()}

      {/* Frequency distribution */}
      {data.kpi.uniqueClients > 0 && (
        <SectionCard
          title="Честота на поръчките"
          subtitle="разпределение на клиентите по брой поръчки"
          icon={FiClock}
          gradient="from-slate-500 to-slate-600"
          className="mb-4"
        >
          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: "f1", label: "1 поръчка", color: "slate" },
              { key: "f2", label: "2 поръчки", color: "indigo" },
              { key: "f3", label: "3 поръчки", color: "violet" },
              { key: "f4plus", label: "4+ поръчки", color: "emerald" },
            ].map((b) => {
              const value = data.clientFrequency[b.key] || 0;
              const pctVal = data.kpi.uniqueClients > 0 ? (value / data.kpi.uniqueClients) * 100 : 0;
              return (
                <div key={b.key} className={`rounded-xl bg-${b.color}-50/60 border border-${b.color}-100 p-3 text-center`}>
                  <p className={`text-[10px] font-bold text-${b.color}-600 uppercase tracking-wider mb-1`}>{b.label}</p>
                  <p className={`text-xl font-bold text-${b.color}-700 tabular-nums leading-tight`}>{value}</p>
                  <p className="text-[10px] text-slate-400 tabular-nums mt-0.5">{pctVal.toFixed(0)}%</p>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      <ClientProfileModal
        isOpen={!!profilePhone}
        phone={profilePhone}
        onClose={() => setProfilePhone(null)}
        onNameChange={() => {}}
      />
    </>
  );
};

export default ClientOrdersStatsTab;
