"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, Spinner, Chip, Tabs, Tab } from "@heroui/react";
import { FiArrowLeft, FiArrowUp, FiArrowDown, FiDollarSign, FiTrendingDown, FiShoppingBag, FiTrendingUp, FiPackage, FiMinus, FiPieChart, FiAward } from "react-icons/fi";
import { TbMoneybag } from "react-icons/tb";
import Layout from "@/components/layout/Dashboard";
import DatePicker from "@/components/html/DatePicker";
import { formatCurrency, productTitle } from "@/utils";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const presets = [
  { key: "week", label: "Тази седмица vs миналата" },
  { key: "month", label: "Този месец vs миналия" },
  { key: "quarter", label: "Това тримесечие vs миналото" },
  { key: "year", label: "Тази година vs миналата" },
];

const getPresetRange = (key) => {
  const now = new Date();
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  if (key === "week") {
    const day = now.getDay() || 7;
    const curStart = new Date(now); curStart.setDate(now.getDate() - day + 1);
    const curEnd = new Date(now); // до днес
    const prevStart = new Date(curStart); prevStart.setDate(curStart.getDate() - 7);
    const prevEnd = new Date(curEnd); prevEnd.setDate(curEnd.getDate() - 7);
    return { from1: fmt(curStart), to1: fmt(curEnd), from2: fmt(prevStart), to2: fmt(prevEnd) };
  }
  if (key === "month") {
    const curStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const curEnd = new Date(now); // до днес
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    return { from1: fmt(curStart), to1: fmt(curEnd), from2: fmt(prevStart), to2: fmt(prevEnd) };
  }
  if (key === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    const curStart = new Date(now.getFullYear(), q * 3, 1);
    const curEnd = new Date(now); // до днес
    const prevStart = new Date(now.getFullYear(), q * 3 - 3, 1);
    const daysDiff = Math.floor((curEnd - curStart) / 86400000);
    const prevEnd = new Date(prevStart); prevEnd.setDate(prevStart.getDate() + daysDiff);
    return { from1: fmt(curStart), to1: fmt(curEnd), from2: fmt(prevStart), to2: fmt(prevEnd) };
  }
  // year
  const curStart = new Date(now.getFullYear(), 0, 1);
  const curEnd = new Date(now); // до днес
  const prevStart = new Date(now.getFullYear() - 1, 0, 1);
  const prevEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  return { from1: fmt(curStart), to1: fmt(curEnd), from2: fmt(prevStart), to2: fmt(prevEnd) };
};

const pct = (a, b) => {
  if (!b) return a === 0 ? 0 : a > 0 ? 100 : -100;
  return ((a - b) / Math.abs(b)) * 100;
};

const Sparkline = ({ points = [], color = "#6366f1" }) => {
  if (points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const W = 200, H = 60;
  const step = W / (points.length - 1);
  const coords = points.map((v, i) => [i * step, H - ((v - min) / range) * (H - 4) - 2]);
  const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${W},${H} L0,${H} Z`;
  const gradId = `grad-${color.replace("#", "")}-${points.length}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  );
};

const KpiCard = ({ label, icon, curr, prev, fmt = (v) => v, invertColors = false, sparkData = [], sparkColor = "#6366f1", gradient = "from-indigo-500 to-violet-500", bgTint = "from-indigo-50/40 to-white" }) => {
  const Icon = icon;
  const change = pct(curr, prev);
  const isUp = change > 0;
  const good = invertColors ? !isUp : isUp;
  const trendColor = change === 0 ? "slate" : good ? "emerald" : "rose";
  const Arrow = change === 0 ? FiMinus : isUp ? FiArrowUp : FiArrowDown;

  return (
    <div className={`relative bg-gradient-to-br ${bgTint} rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all`}>
      {/* Background sparkline — за декорация зад цифрите */}
      <div className="absolute inset-0 pointer-events-none opacity-30 flex items-end">
        <div className="w-full h-2/3">
          <Sparkline points={sparkData} color={sparkColor} />
        </div>
      </div>

      <div className="relative p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md shadow-indigo-500/10`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>

        <div>
          <p className="text-2xl font-bold text-slate-800 tabular-nums leading-tight">{fmt(curr)}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-${trendColor}-50 text-${trendColor}-600`}>
              <Arrow className="w-2.5 h-2.5" />
              <span className="tabular-nums">{Math.abs(change).toFixed(1)}%</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">преди: <span className="tabular-nums font-bold text-slate-700">{fmt(prev)}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatRange = (from, to) => {
  const fmt = (s) => {
    if (!s) return "—";
    const [y, m, d] = String(s).split("T")[0].split("-");
    return `${d}.${m}.${y}`;
  };
  return `${fmt(from)} – ${fmt(to)}`;
};

const TopProductsCompare = ({ period1, period2 }) => {
  const rank2 = new Map(period2.topProducts.map((p, i) => [String(p._id), i + 1]));
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100">
        <p className="text-sm font-bold text-slate-800">Топ 5 продукти — текущ период</p>
      </div>
      {period1.topProducts.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">Няма доставени поръчки</div>
      ) : (
        <ul className="divide-y divide-slate-50">
          {period1.topProducts.map((p, i) => {
            const prevRank = rank2.get(String(p._id));
            let badge;
            if (!prevRank) badge = <Chip size="sm" color="primary" variant="flat" className="text-[10px] h-5">нов</Chip>;
            else if (prevRank > i + 1) badge = <span className="text-emerald-600 text-xs font-bold flex items-center gap-0.5"><FiArrowUp className="w-3 h-3" />{prevRank - (i + 1)}</span>;
            else if (prevRank < i + 1) badge = <span className="text-rose-500 text-xs font-bold flex items-center gap-0.5"><FiArrowDown className="w-3 h-3" />{(i + 1) - prevRank}</span>;
            else badge = <FiMinus className="w-3 h-3 text-slate-300" />;

            return (
              <li key={String(p._id)} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors">
                <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                {p.image_url ? (
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-50 border border-slate-200">
                    <Image src={p.image_url} alt={p.name || ""} width={32} height={32} sizes="32px" className="w-full h-full object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <FiPackage className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{productTitle(p)}</p>
                  <p className="text-[11px] text-slate-400">{p.qty} бр. · {p.count} поръчки</p>
                </div>
                <span className="text-sm font-bold text-indigo-600 tabular-nums shrink-0">{formatCurrency(p.revenue, 2)}</span>
                <span className="shrink-0 w-8 flex justify-end">{badge}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const CategoryPie = ({ title, data, subtitle }) => {
  const total = data.reduce((s, c) => s + c.revenue, 0);
  const series = data.map((c) => c.revenue);
  const labels = data.map((c) => c._id);

  const options = {
    chart: { type: "donut", fontFamily: "Inter, sans-serif", toolbar: { show: false } },
    labels,
    colors: ["#6366f1", "#f59e0b", "#10b981", "#0ea5e9", "#ef4444", "#a855f7"],
    legend: { position: "bottom", fontSize: "11px" },
    dataLabels: { enabled: true, style: { fontSize: "11px" }, formatter: (val) => `${val.toFixed(0)}%` },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Общо",
              fontSize: "11px",
              color: "#94a3b8",
              formatter: () => formatCurrency(total, 2),
            },
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="text-[11px] text-slate-400 mb-2">{subtitle}</p>
      {data.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-300">Няма данни</div>
      ) : (
        <ReactApexChart type="donut" options={options} series={series} height={250} />
      )}
    </div>
  );
};

const CompareClient = () => {
  const router = useRouter();
  const [range, setRange] = useState(() => getPresetRange("month"));
  const [activePreset, setActivePreset] = useState("month");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(range);
    fetch(`/api/dashboard/compare?${params}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [range]);

  const chartOptions = useMemo(() => ({
    chart: { type: "area", fontFamily: "Inter, sans-serif", toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: "smooth", width: [2.5, 2], dashArray: [0, 6] },
    colors: ["#6366f1", "#94a3b8"],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: [0.35, 0.08], opacityTo: [0, 0], stops: [0, 100] },
    },
    xaxis: {
      categories: Array.from({ length: Math.max(
        data?.period1?.revenueTimeSeries?.length || data?.period1?.timeSeries?.length || 0,
        data?.period2?.revenueTimeSeries?.length || data?.period2?.timeSeries?.length || 0,
        1
      ) }, (_, i) => `Ден ${i + 1}`),
      labels: { style: { fontSize: "11px", colors: "#94a3b8" } },
    },
    yaxis: { labels: { formatter: (v) => formatCurrency(v, 0), style: { fontSize: "11px", colors: "#94a3b8" } } },
    legend: { position: "top", horizontalAlign: "right", fontSize: "12px" },
    tooltip: {
      shared: true,
      intersect: false,
      custom: ({ dataPointIndex }) => {
        const ts1 = data?.period1?.revenueTimeSeries || [];
        const ts2 = data?.period2?.revenueTimeSeries || [];
        const d1 = ts1[dataPointIndex];
        const d2 = ts2[dataPointIndex];
        const fmtDate = (s) => {
          if (!s) return "—";
          const [y, m, d] = s.split("-");
          return `${d}.${m}.${y}`;
        };
        const fmtVal = (v) => v != null ? formatCurrency(v, 0) : "—";
        return `
          <div style="padding:10px 12px;font-family:Inter,sans-serif;">
            <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Ден ${dataPointIndex + 1}</div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span style="width:8px;height:8px;border-radius:50%;background:#6366f1;"></span>
              <span style="font-size:11px;color:#64748b;">${fmtDate(d1?.date)}</span>
              <span style="font-size:12px;font-weight:700;color:#1e293b;margin-left:auto;">${fmtVal(d1?.revenue)}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="width:8px;height:8px;border-radius:50%;background:#94a3b8;"></span>
              <span style="font-size:11px;color:#64748b;">${fmtDate(d2?.date)}</span>
              <span style="font-size:12px;font-weight:700;color:#475569;margin-left:auto;">${fmtVal(d2?.revenue)}</span>
            </div>
          </div>
        `;
      },
    },
    grid: { borderColor: "#f1f5f9" },
  }), [data]);

  const series = useMemo(() => {
    if (!data) return [];
    const toData = (ts = []) => ts.map((t) => t.revenue);
    return [
      { name: "Текущ период", data: toData(data.period1.revenueTimeSeries || data.period1.timeSeries) },
      { name: "Предишен период", data: toData(data.period2.revenueTimeSeries || data.period2.timeSeries) },
    ];
  }, [data]);

  const applyPreset = (key) => {
    setActivePreset(key);
    setRange(getPresetRange(key));
  };

  return (
    <Layout title="Сравнение на периоди">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 pb-20">
        {/* Periods + presets */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-2">Текущ период</p>
              <div className="flex items-center gap-2">
                <div className="flex-1"><DatePicker label="От" value={range.from1} maxValue={range.to1}
                  onChange={(v) => { setActivePreset(null); setRange({ ...range, from1: v || "" }); }} /></div>
                <div className="flex-1"><DatePicker label="До" value={range.to1} minValue={range.from1}
                  onChange={(v) => { setActivePreset(null); setRange({ ...range, to1: v || "" }); }} /></div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Сравнение с</p>
              <div className="flex items-center gap-2">
                <div className="flex-1"><DatePicker label="От" value={range.from2} maxValue={range.to2}
                  onChange={(v) => { setActivePreset(null); setRange({ ...range, from2: v || "" }); }} /></div>
                <div className="flex-1"><DatePicker label="До" value={range.to2} minValue={range.from2}
                  onChange={(v) => { setActivePreset(null); setRange({ ...range, to2: v || "" }); }} /></div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button key={p.key} onClick={() => applyPreset(p.key)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  activePreset === p.key
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : "bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-600"
                }`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading || !data ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard label="Приходи" icon={FiDollarSign}
                curr={data.period1.revenue} prev={data.period2.revenue}
                fmt={(v) => formatCurrency(v, 2)}
                sparkData={data.period1.timeSeries.map((t) => t.revenue)}
                sparkColor="#10b981"
                gradient="from-emerald-500 to-teal-500"
                bgTint="from-emerald-50/40 to-white" />
              <KpiCard label="Разходи" icon={FiTrendingDown}
                curr={data.period1.expenses} prev={data.period2.expenses}
                fmt={(v) => formatCurrency(v, 2)} invertColors
                sparkData={data.period1.timeSeries.map((t) => t.expenses)}
                sparkColor="#f43f5e"
                gradient="from-rose-500 to-red-500"
                bgTint="from-rose-50/40 to-white" />
              <KpiCard label="Печалба" icon={TbMoneybag}
                curr={data.period1.profit} prev={data.period2.profit}
                fmt={(v) => formatCurrency(v, 2)}
                sparkData={data.period1.timeSeries.map((t) => t.profit)}
                sparkColor="#8b5cf6"
                gradient="from-violet-500 to-indigo-500"
                bgTint="from-violet-50/40 to-white" />
              <KpiCard label="Поръчки" icon={FiShoppingBag}
                curr={data.period1.orders} prev={data.period2.orders}
                fmt={(v) => `${v} бр.`}
                sparkData={data.period1.timeSeries.map((t) => t.orders)}
                sparkColor="#6366f1"
                gradient="from-indigo-500 to-violet-500"
                bgTint="from-indigo-50/40 to-white" />
            </div>

            {/* Overlay LineChart */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiTrendingUp className="w-4 h-4 text-indigo-500" />
                <p className="text-sm font-bold text-slate-800">Приходи — overlay на двата периода</p>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> {formatRange(data.period1.from, data.period1.to)}</span>
                <span className="mx-2 text-slate-300">·</span>
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" /> {formatRange(data.period2.from, data.period2.to)}</span>
              </p>
              <ReactApexChart type="area" options={chartOptions} series={series} height={320} />
            </div>

            {/* Top Products + Category pies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <TopProductsCompare period1={data.period1} period2={data.period2} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CategoryPie title="Текущ" subtitle={formatRange(data.period1.from, data.period1.to)} data={data.period1.byCategory} />
                <CategoryPie title="Предишен" subtitle={formatRange(data.period2.from, data.period2.to)} data={data.period2.byCategory} />
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default CompareClient;
