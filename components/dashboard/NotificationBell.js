"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { FiBell, FiPlus, FiEdit2, FiTrash2, FiRefreshCw } from "react-icons/fi";
import PusherClient from "pusher-js";

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "преди малко";
  if (mins < 60) return `преди ${mins} мин.`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `преди ${hours} ч.`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `преди ${days} д.`;
  return new Date(date).toLocaleDateString("bg-BG", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function notifInfo(n) {
  const num = n.orderNumber ? `#${n.orderNumber} ` : "";
  if (n.type === "created")
    return { text: `Нова заявка ${num}добавена от ${n.changedBy}`, Icon: FiPlus, color: "text-green-600 bg-green-50" };
  if (n.type === "deleted")
    return { text: `Заявка ${num}изтрита от ${n.changedBy}`, Icon: FiTrash2, color: "text-red-500 bg-red-50" };
  if (n.type === "updated" && n.change === "status") {
    const color =
      n.status === "доставена" ? "text-green-600 bg-green-50"
      : n.status === "отказана" ? "text-red-500 bg-red-50"
      : "text-blue-600 bg-blue-50";
    return { text: `Заявка ${num}→ ${n.status} от ${n.changedBy}`, Icon: FiRefreshCw, color };
  }
  return { text: `Заявка ${num}редактирана от ${n.changedBy}`, Icon: FiEdit2, color: "text-blue-600 bg-blue-50" };
}

function shouldReceive(event, userId, role) {
  if (!userId) return false;
  if (event.changedByUserId && String(event.changedByUserId) === String(userId)) return false;
  if (role === "Seller") return event.assignedTo && String(event.assignedTo) === String(userId);
  return true;
}

const NotificationBell = () => {
  const { data: session } = useSession();
  const sessionRef = useRef(session);
  useEffect(() => { sessionRef.current = session; }, [session]);

  const [isOpen, setIsOpen]               = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [hasMore, setHasMore]             = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [markedReadAt, setMarkedReadAt]   = useState(null);

  const pageRef      = useRef(1);
  const isLoadingRef = useRef(false);
  const hasMoreRef   = useRef(false);
  const scrollRef    = useRef(null);

  const fetchPage = useCallback(async (page, replace = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/notifications?page=${page}`);
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(prev => replace ? data.items : [...prev, ...data.items]);
      setUnreadCount(data.unreadCount);
      hasMoreRef.current = data.hasMore;
      setHasMore(data.hasMore);
      pageRef.current = page;
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchPage(1, true); }, [fetchPage]);

  // Pusher — само incrementира badge, не модифицира списъка
  useEffect(() => {
    const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
    const channel = pusher.subscribe("client-orders");
    channel.bind("order-event", (event) => {
      const s = sessionRef.current;
      if (!shouldReceive(event, s?.user?.id, s?.user?.role)) return;
      setUnreadCount(prev => prev + 1);
    });
    return () => { channel.unbind_all(); pusher.disconnect(); };
  }, []);

  // Infinite scroll чрез onScroll
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 60 && hasMoreRef.current && !isLoadingRef.current) {
      fetchPage(pageRef.current + 1);
    }
  }, [fetchPage]);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) return;
    (async () => {
      // Зареди актуален списък
      await fetchPage(1, true);
      // Маркирай всички като прочетени
      await fetch("/api/notifications", { method: "PATCH" });
      setUnreadCount(0);
      setMarkedReadAt(new Date());
    })();
  };

  const isUnread = (n) => {
    if (markedReadAt && new Date(n.createdAt) <= markedReadAt) return false;
    const uid = session?.user?.id;
    return uid ? !n.readBy?.includes(String(uid)) : false;
  };

  return (
    <Popover isOpen={isOpen} onOpenChange={handleOpenChange} placement="bottom-end">
      <PopoverTrigger>
        <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <FiBell className="w-5 h-5 text-slate-500" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-80 overflow-hidden">
        {/* Хедър */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="font-semibold text-slate-700 text-sm">Известия</span>
          {unreadCount > 0 && (
            <span className="text-xs font-semibold text-blue-500">{unreadCount} нови</span>
          )}
        </div>

        {/* Списък */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-y-auto"
          style={{ maxHeight: 380 }}>

          {notifications.length === 0 && !isLoading && (
            <p className="text-sm text-slate-400 text-center py-10">Няма известия</p>
          )}

          {notifications.map((n) => {
            const { text, Icon, color } = notifInfo(n);
            const unread = isUnread(n);
            return (
              <div
                key={n._id}
                className={`px-4 py-3 border-b border-slate-50 flex gap-3 items-start transition-colors ${unread ? "bg-blue-50/50" : "hover:bg-slate-50"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 leading-snug">{text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                {unread && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />}
              </div>
            );
          })}

          {/* Loader / sentinel */}
          <div className="py-3 flex justify-center min-h-[36px]">
            {isLoading && <span className="text-xs text-slate-400">Зарежда...</span>}
            {!isLoading && !hasMore && notifications.length > 0 && (
              <span className="text-xs text-slate-300">Край на известията</span>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
