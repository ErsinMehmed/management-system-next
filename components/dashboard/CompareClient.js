"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, Spinner, Chip, Tabs, Tab } from "@heroui/react";
import { FiArrowLeft, FiArrowUp, FiArrowDown, FiDollarSign, FiTrendingDown, FiShoppingBag, FiTrendingUp, FiPackage, FiMinus, FiPieChart, FiAward, FiUsers, FiUserPlus, FiRepeat, FiUserX } from "react-icons/fi";
import { TbMoneybag } from "react-icons/tb";
import Layout from "@/components/layout/Dashboard";
import DatePicker from "@/components/html/DatePicker";
import ClientProfileModal from "@/components/dashboard/ClientOrders/ClientProfileModal";
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

const formatShortDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return `${String(dt.getDate()).padStart(2, "0")}.${String(dt.getMonth() + 1).padStart(2, "0")}.${dt.getFullYear()}`;
};

const ClientsModule = ({ period1 }) => {
  const c = period1.clients;
  const [profilePhone, setProfilePhone] = useState(null);
  if (!c) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-xs text-slate-400">
        Няма данни за клиенти
      </div>
    );
  }

  const newPct = c.total > 0 ? (c.newCount / c.total) * 100 : 0;
  const retPct = c.total > 0 ? (c.returningCount / c.total) * 100 : 0;

  return (
    <>
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <FiUsers className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800">Клиенти — текущ период</p>
          <p className="text-[11px] text-slate-400 truncate">
            {c.total} уникални клиента · преди: {c.totalPrev}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <FiUserPlus className="w-3 h-3 text-emerald-500" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Нови</p>
          </div>
          <p className="text-xl font-bold text-emerald-600 tabular-nums leading-tight">{c.newCount}</p>
          <p className="text-[10px] text-slate-400 tabular-nums mt-0.5">{newPct.toFixed(0)}% от общо</p>
        </div>
        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <FiRepeat className="w-3 h-3 text-indigo-500" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Повторни</p>
          </div>
          <p className="text-xl font-bold text-indigo-600 tabular-nums leading-tight">{c.returningCount}</p>
          <p className="text-[10px] text-slate-400 tabular-nums mt-0.5">{retPct.toFixed(0)}% от общо</p>
        </div>
        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <FiAward className="w-3 h-3 text-violet-500" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Задържане</p>
          </div>
          <p className="text-xl font-bold text-violet-600 tabular-nums leading-tight">
            {(c.retentionRate * 100).toFixed(0)}%
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">върнати от пред.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-slate-100">
        <div>
          <div className="px-5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Топ 5 клиенти</p>
            <span className="text-[10px] text-slate-400">по приходи</span>
          </div>
          {c.topClients.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">Няма доставени поръчки</div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {c.topClients.map((cl, i) => {
                const aov = cl.orders > 0 ? cl.revenue / cl.orders : 0;
                return (
                  <li
                    key={cl.phone}
                    onClick={() => setProfilePhone(cl.phone)}
                    className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
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
        </div>

        <div className="border-t lg:border-t-0 border-slate-100">
          <div className="px-5 py-2.5 bg-rose-50/30 border-b border-rose-100/50 flex items-center gap-1.5">
            <FiUserX className="w-3 h-3 text-rose-500" />
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">„Загубени" клиенти</p>
            <span className="text-[10px] text-slate-400 ml-auto whitespace-nowrap">поръчвали преди, не сега</span>
          </div>
          {!c.lostClients?.length ? (
            <div className="py-6 text-center text-xs text-slate-400">Всички стари клиенти се върнаха</div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {c.lostClients.map((cl) => (
                <li
                  key={cl.phone}
                  onClick={() => setProfilePhone(cl.phone)}
                  className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50/60 transition-colors cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-md bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                    <FiUserX className="w-3 h-3" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">
                      {cl.name || <span className="tabular-nums">{cl.phone}</span>}
                    </p>
                    <p className="text-[11px] text-slate-400 tabular-nums truncate">
                      {cl.name ? `${cl.phone} · ` : ""}{cl.orders} поръчки преди · последна {formatShortDate(cl.lastOrder)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-600 tabular-nums shrink-0 whitespace-nowrap">
                    {formatCurrency(cl.revenue, 2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
    <ClientProfileModal
      isOpen={!!profilePhone}
      phone={profilePhone}
      onClose={() => setProfilePhone(null)}
      onNameChange={() => {}}
    />
    </>
  );
};

const AllProductsTable = ({ period1, period2 }) => {
  const [sort, setSort] = useState("revenue");
  const prevMap = new Map(period2.allProducts.map((p) => [String(p._id), p]));
  const currIds = new Set(period1.allProducts.map((p) => String(p._id)));

  // Merge: всички продукти които имат продажби в поне един от двата периода
  const merged = [
    ...period1.allProducts.map((p) => {
      const prev = prevMap.get(String(p._id));
      return {
        ...p,
        qty2: prev?.qty || 0,
        revenue2: prev?.revenue || 0,
        profit2: prev?.profit || 0,
        count2: prev?.count || 0,
      };
    }),
    ...period2.allProducts
      .filter((p) => !currIds.has(String(p._id)))
      .map((p) => ({
        _id: p._id, name: p.name, weight: p.weight, flavor: p.flavor, puffs: p.puffs,
        count: 0, image_url: p.image_url, cost_price: p.cost_price,
        qty: 0, revenue: 0, profit: 0,
        qty2: p.qty, revenue2: p.revenue, profit2: p.profit, count2: p.count,
      })),
  ];

  const sorted = [...merged].sort((a, b) => {
    if (sort === "revenue") return b.revenue - a.revenue;
    if (sort === "profit") return b.profit - a.profit;
    if (sort === "qty") return b.qty - a.qty;
    if (sort === "change") {
      const chA = a.revenue2 > 0 ? ((a.revenue - a.revenue2) / a.revenue2) : (a.revenue > 0 ? 1 : 0);
      const chB = b.revenue2 > 0 ? ((b.revenue - b.revenue2) / b.revenue2) : (b.revenue > 0 ? 1 : 0);
      return chB - chA;
    }
    return 0;
  });

  const TrendBadge = ({ curr, prev }) => {
    if (prev === 0 && curr === 0) return <span className="text-[10px] text-slate-300">—</span>;
    if (prev === 0) return <Chip size="sm" color="success" variant="flat" className="text-[10px] h-5">нов</Chip>;
    if (curr === 0) return <Chip size="sm" color="danger" variant="flat" className="text-[10px] h-5">спрял</Chip>;
    const pctChange = ((curr - prev) / Math.abs(prev)) * 100;
    const isUp = pctChange > 0;
    return (
      <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
        isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
      }`}>
        {isUp ? <FiArrowUp className="w-2.5 h-2.5" /> : <FiArrowDown className="w-2.5 h-2.5" />}
        <span className="tabular-nums">{Math.abs(pctChange).toFixed(1)}%</span>
      </div>
    );
  };

  const SortBtn = ({ k, children }) => (
    <button
      onClick={() => setSort(k)}
      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-colors ${
        sort === k ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-indigo-600"
      }`}>
      {children}
    </button>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <FiPackage className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Сравнение на продукти</p>
            <p className="text-[11px] text-slate-400">{merged.length} продукта с продажби</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5">
          <SortBtn k="revenue">Оборот</SortBtn>
          <SortBtn k="profit">Печалба</SortBtn>
          <SortBtn k="qty">Количество</SortBtn>
          <SortBtn k="change">Промяна</SortBtn>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-2.5 w-8 whitespace-nowrap">#</th>
              <th className="text-left px-3 py-2.5 whitespace-nowrap">Продукт</th>
              <th className="text-right px-3 py-2.5 whitespace-nowrap">Количество</th>
              <th className="text-right px-3 py-2.5 whitespace-nowrap">Продажби</th>
              <th className="text-right px-3 py-2.5 whitespace-nowrap">Оборот</th>
              <th className="text-right px-3 py-2.5 whitespace-nowrap">Печалба</th>
              <th className="text-right px-5 py-2.5 whitespace-nowrap">Промяна</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sorted.map((p, i) => {
              return (
                <tr key={String(p._id)} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-5 py-2.5 text-[11px] font-bold text-slate-400 tabular-nums">{i + 1}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {p.image_url ? (
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-50 border border-slate-200">
                          <Image src={p.image_url} alt={p.name || ""} width={32} height={32} sizes="32px" className="w-full h-full object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <FiPackage className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{productTitle(p)}</p>
                        {p.flavor && <p className="text-[10px] text-slate-400 truncate">{p.flavor}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <p className="text-sm font-bold text-slate-700 tabular-nums">{p.qty}</p>
                    <p className="text-[10px] text-slate-400 tabular-nums">преди: {p.qty2}</p>
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <p className="text-sm font-bold text-slate-700 tabular-nums">{p.count}</p>
                    <p className="text-[10px] text-slate-400 tabular-nums">преди: {p.count2}</p>
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <p className="text-sm font-bold text-indigo-600 tabular-nums">{formatCurrency(p.revenue, 2)}</p>
                    <p className="text-[10px] text-slate-400 tabular-nums">{formatCurrency(p.revenue2, 2)}</p>
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <p className={`text-sm font-bold tabular-nums ${p.profit >= 0 ? "text-emerald-600" : "text-rose-500"}`}>{formatCurrency(p.profit, 2)}</p>
                    <p className="text-[10px] text-slate-400 tabular-nums">{formatCurrency(p.profit2, 2)}</p>
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <TrendBadge curr={p.revenue} prev={p.revenue2} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
    <Layout title="Анализ на периоди">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 pb-10">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            </div>

            {/* Overlay LineChart */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiTrendingUp className="w-4 h-4 text-indigo-500" />
                <p className="text-sm font-bold text-slate-800">Приходи — сравнение на двата периода</p>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> {formatRange(data.period1.from, data.period1.to)}</span>
                <span className="mx-2 text-slate-300">·</span>
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" /> {formatRange(data.period2.from, data.period2.to)}</span>
              </p>
              <div className="overflow-x-auto sm:overflow-visible -mx-4 sm:mx-0 px-4 sm:px-0 pb-1">
                <div
                  className="sm:min-w-0!"
                  style={{ minWidth: Math.max(
                    (data?.period1?.revenueTimeSeries?.length || data?.period1?.timeSeries?.length || 0),
                    (data?.period2?.revenueTimeSeries?.length || data?.period2?.timeSeries?.length || 0),
                    1
                  ) * 55 }}
                >
                  <ReactApexChart type="area" options={chartOptions} series={series} height={320} />
                </div>
              </div>
            </div>

            {/* Clients module — full width */}
            <ClientsModule period1={data.period1} period2={data.period2} />

            {/* Category pies — full width row, 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CategoryPie title="Текущ" subtitle={formatRange(data.period1.from, data.period1.to)} data={data.period1.byCategory} />
              <CategoryPie title="Предишен" subtitle={formatRange(data.period2.from, data.period2.to)} data={data.period2.byCategory} />
            </div>

            {/* Подробна таблица на всички продукти */}
            <AllProductsTable period1={data.period1} period2={data.period2} />
          </>
        )}
      </div>
    </Layout>
  );
};

export default CompareClient;
