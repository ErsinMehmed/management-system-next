"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Spinner, Button } from "@heroui/react";
import { FiUser, FiPhone, FiSearch, FiChevronRight, FiX, FiPlus } from "react-icons/fi";
import ClientProfileModal from "@/components/dashboard/ClientOrders/ClientProfileModal";
import AddClientModal from "@/components/dashboard/ClientOrders/AddClientModal";
import { SkeletonListRow } from "@/components/Skeleton";

function ClientRow({ item, onOpenProfile }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-slate-50/60 transition-colors group cursor-pointer"
      onClick={() => onOpenProfile?.(item.phone)}>
      <div className="w-9 h-9 rounded-xl bg-[#0071f5]/10 flex items-center justify-center shrink-0">
        <FiUser className="w-4 h-4 text-[#0071f5]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0">
            <FiPhone className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-sm font-semibold text-slate-700 tabular-nums group-hover:text-[#0071f5] transition-colors">{item.phone}</span>
          </div>
          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">{item.orderCount} поръч.</span>
          <span className="text-[10px] text-slate-400 whitespace-nowrap sm:hidden">
            · {item.lastOrder ? new Date(item.lastOrder).toLocaleDateString("bg-BG") : "—"}
          </span>
        </div>

        <p className={`text-xs mt-0.5 ${item.name ? "font-medium text-slate-600" : "text-slate-300 italic"}`}>
          {item.name || "Няма въведено название"}
        </p>
      </div>

      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-[10px] text-slate-400">Последна поръчка</p>
        <p className="text-xs font-medium text-slate-500">
          {item.lastOrder ? new Date(item.lastOrder).toLocaleDateString("bg-BG") : "—"}
        </p>
      </div>
      <FiChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0071f5] shrink-0 transition-colors" />
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
  const [profilePhone, setProfilePhone] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

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

  const handleNameUpdate = (phone, name) => {
    setItems((prev) => prev.map((i) => (i.phone === phone ? { ...i, name } : i)));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Търсене */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-3">
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
        <Button color="primary" radius="full"
          className="shrink-0 font-semibold h-[40px] px-4 sm:px-5"
          startContent={<FiPlus className="w-4 h-4" />}
          onPress={() => setShowAddModal(true)}>
          <span className="hidden sm:inline">Добави</span>
        </Button>
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
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonListRow key={i} />
            ))}
          </>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <FiUser className="w-8 h-8 text-slate-200" />
            <p className="text-sm font-semibold text-slate-400">Няма намерени клиенти</p>
          </div>
        ) : (
          <>
            {items.map((item) => (
              <ClientRow key={item.phone} item={item} onOpenProfile={setProfilePhone} />
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

      <ClientProfileModal
        isOpen={!!profilePhone}
        phone={profilePhone}
        onClose={() => setProfilePhone(null)}
        onNameChange={handleNameUpdate}
      />

      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={() => fetchPage(1, searchRef.current, true)}
      />
    </div>
  );
}
