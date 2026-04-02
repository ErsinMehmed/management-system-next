"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Spinner } from "@heroui/react";
import { FiUser, FiPhone, FiEdit2, FiCheck, FiX, FiSearch } from "react-icons/fi";

function ClientRow({ item, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.name);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(item.phone, value);
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setValue(item.name);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-slate-50/60 transition-colors group">
      <div className="w-9 h-9 rounded-xl bg-[#0071f5]/10 flex items-center justify-center shrink-0">
        <FiUser className="w-4 h-4 text-[#0071f5]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <FiPhone className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="text-sm font-semibold text-slate-700 tabular-nums">{item.phone}</span>
          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{item.orderCount} поръч.</span>
        </div>

        {editing ? (
          <div className="flex items-center gap-2 mt-1.5">
            <input
              autoFocus
              type="text"
              placeholder="Въведи название"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
              className="text-sm border border-gray-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-[#0071f5]/30 w-48"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-6 h-6 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors disabled:opacity-50">
              {saving ? <Spinner size="sm" color="success" className="scale-75" /> : <FiCheck className="w-3.5 h-3.5 text-green-600" />}
            </button>
            <button
              onClick={handleCancel}
              className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-red-100 flex items-center justify-center transition-colors">
              <FiX className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-0.5">
            <p className={`text-xs ${item.name ? "font-medium text-slate-600" : "text-slate-300 italic"}`}>
              {item.name || "Няма въведено название"}
            </p>
            <button
              onClick={() => setEditing(true)}
              className="w-5 h-5 rounded-md bg-slate-100 hover:bg-[#0071f5]/10 flex items-center justify-center transition-colors">
              <FiEdit2 className="w-3 h-3 text-slate-400 hover:text-[#0071f5]" />
            </button>
          </div>
        )}
      </div>

      <div className="text-right shrink-0">
        <p className="text-[10px] text-slate-400">Последна поръчка</p>
        <p className="text-xs font-medium text-slate-500">
          {item.lastOrder ? new Date(item.lastOrder).toLocaleDateString("bg-BG") : "—"}
        </p>
      </div>
    </div>
  );
}

export default function ClientOrdersClientsTab() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");

  // Refs за scroll listener — избягват stale closure
  const pageRef = useRef(1);
  const searchRef = useRef("");
  const hasMoreRef = useRef(false);
  const isLoadingMoreRef = useRef(false);
  const searchTimer = useRef(null);

  const fetchPage = useCallback(async (pageNum, searchVal, replace = false) => {
    if (replace) {
      setIsLoading(true);
    } else {
      if (isLoadingMoreRef.current) return;
      isLoadingMoreRef.current = true;
      setIsLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({ page: pageNum, search: searchVal });
      const res = await fetch(`/api/client-phones?${params}`);
      const data = await res.json();

      setItems((prev) => replace ? data.items : [...prev, ...data.items]);
      setHasMore(data.hasMore);
      setTotal(data.total);
      pageRef.current = pageNum;
      hasMoreRef.current = data.hasMore;
    } finally {
      if (replace) {
        setIsLoading(false);
      } else {
        isLoadingMoreRef.current = false;
        setIsLoadingMore(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPage(1, "", true);
  }, [fetchPage]);

  // Debounced search
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      searchRef.current = searchInput;
      pageRef.current = 1;
      fetchPage(1, searchInput, true);
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [searchInput, fetchPage]);

  // Window scroll listener за infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300;
      if (nearBottom && hasMoreRef.current && !isLoadingMoreRef.current) {
        fetchPage(pageRef.current + 1, searchRef.current);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchPage]);

  const handleSave = async (phone, name) => {
    await fetch("/api/client-phones", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, name }),
    });
    setItems((prev) => prev.map((i) => (i.phone === phone ? { ...i, name } : i)));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Търсене */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-3">
        <FiSearch className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Търси по телефон или название..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 text-sm text-slate-700 placeholder:text-slate-300 outline-none bg-transparent"
        />
        {searchInput && (
          <button onClick={() => setSearchInput("")} className="text-slate-300 hover:text-slate-500 transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Списък */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0071f5]/10 flex items-center justify-center">
              <FiUser className="w-3.5 h-3.5 text-[#0071f5]" />
            </div>
            <span className="text-sm font-bold text-slate-700">Клиенти</span>
          </div>
          {!isLoading && (
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {items.length} / {total}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#0071f5] border-t-transparent animate-spin" />
            <span className="text-sm text-slate-400 font-medium">Зареждане...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <FiUser className="w-8 h-8 text-slate-200" />
            <p className="text-sm font-semibold text-slate-400">Няма намерени клиенти</p>
          </div>
        ) : (
          <>
            {items.map((item) => (
              <ClientRow key={item.phone} item={item} onSave={handleSave} />
            ))}
            {isLoadingMore && (
              <div className="flex items-center justify-center py-5">
                <div className="w-5 h-5 rounded-full border-2 border-[#0071f5] border-t-transparent animate-spin" />
              </div>
            )}
            {!hasMore && items.length > 0 && (
              <div className="text-center py-4 text-xs text-slate-300 font-medium">
                Всички {total} клиента са заредени
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
