"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Popover } from "@heroui/react";
import { FiBell, FiPlus, FiEdit2, FiTrash2, FiRefreshCw } from "react-icons/fi";
import PusherClient from "pusher-js";

// ─── helpers ────────────────────────────────────────────────────────────────

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

// ─── SwipeableItem ───────────────────────────────────────────────────────────

const SWIPE_THRESHOLD = 80; // px наляво за изтриване

const SwipeableItem = ({ id, onDelete, children }) => {
  const [offset, setOffset]     = useState(0);
  const [dragging, setDragging] = useState(false);
  const [removing, setRemoving] = useState(false);

  const startXRef    = useRef(null);
  const startYRef    = useRef(null);
  const lockedRef    = useRef(null); // 'h' | 'v' | null

  const onStart = (clientX, clientY) => {
    startXRef.current = clientX;
    startYRef.current = clientY;
    lockedRef.current = null;
  };

  const onMove = (clientX, clientY, preventDefault) => {
    if (startXRef.current === null) return;
    const dx = clientX - startXRef.current;
    const dy = clientY - startYRef.current;

    // Определяме посоката при първото движение
    if (!lockedRef.current) {
      if (Math.abs(dx) > Math.abs(dy)) {
        lockedRef.current = "h";
      } else {
        lockedRef.current = "v";
        startXRef.current = null;
        return;
      }
    }
    if (lockedRef.current !== "h") return;

    preventDefault?.();
    if (!dragging) setDragging(true);
    setOffset(Math.min(0, dx)); // само наляво
  };

  const onEnd = () => {
    if (startXRef.current === null) return;
    startXRef.current = null;
    setDragging(false);

    if (offset < -SWIPE_THRESHOLD) {
      setRemoving(true);
      setOffset(-320);
      setTimeout(() => onDelete(id), 280);
    } else {
      setOffset(0);
    }
  };

  // Touch
  const onTouchStart = (e) => onStart(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove  = (e) => onMove(e.touches[0].clientX, e.touches[0].clientY, () => e.preventDefault());
  const onTouchEnd   = () => onEnd();

  // Mouse (desktop)
  const onMouseDown  = (e) => { e.preventDefault(); onStart(e.clientX, e.clientY); };
  const onMouseMove  = (e) => { if (startXRef.current !== null) onMove(e.clientX, e.clientY); };
  const onMouseUp    = () => onEnd();
  const onMouseLeave = () => { if (startXRef.current !== null) onEnd(); };

  const revealWidth = Math.min(64, Math.abs(offset));

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{ height: removing ? 0 : undefined, transition: removing ? "height 0.28s ease" : undefined }}>

      {/* Червен фон с кошче */}
      <div
        className="absolute inset-y-0 right-0 bg-red-500 flex items-center justify-center"
        style={{ width: revealWidth, transition: dragging ? "none" : "width 0.25s ease" }}>
        {revealWidth > 24 && <FiTrash2 className="w-4 h-4 text-white" />}
      </div>

      {/* Съдържание */}
      <div
        style={{
          transform:  `translateX(${offset}px)`,
          transition: dragging ? "none" : "transform 0.25s ease",
          touchAction: "pan-y",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}>
        {children}
      </div>
    </div>
  );
};

// ─── NotificationBell ────────────────────────────────────────────────────────

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

  useEffect(() => { fetchPage(1, true); }, [fetchPage]);

  // Pusher — само badge
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
      await fetchPage(1, true);
      await fetch("/api/notifications", { method: "PATCH" });
      setUnreadCount(0);
      setMarkedReadAt(new Date());
    })();
  };

  const handleDelete = useCallback(async (id) => {
    setNotifications(prev => prev.filter(n => String(n._id) !== String(id)));
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
  }, []);

  const isUnread = (n) => {
    if (markedReadAt && new Date(n.createdAt) <= markedReadAt) return false;
    const uid = session?.user?.id;
    return uid ? !n.readBy?.includes(String(uid)) : false;
  };

  return (
    <Popover isOpen={isOpen} onOpenChange={handleOpenChange} placement="bottom-end">
      <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
        <FiBell className="w-5 h-5 text-slate-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <Popover.Content className="p-0 w-80 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="font-semibold text-slate-700 text-sm">Известия</span>
          {unreadCount > 0 && (
            <span className="text-xs font-semibold text-blue-500">{unreadCount} нови</span>
          )}
        </div>

        <div onScroll={handleScroll} className="overflow-y-auto" style={{ maxHeight: 380 }}>

          {notifications.length === 0 && !isLoading && (
            <p className="text-sm text-slate-400 text-center py-10">Няма известия</p>
          )}

          {notifications.map((n) => {
            const { text, Icon, color } = notifInfo(n);
            const unread = isUnread(n);
            return (
              <SwipeableItem key={n._id} id={n._id} onDelete={handleDelete}>
                <div className={`px-4 py-3 border-b border-slate-50 flex gap-3 items-start transition-colors cursor-default ${unread ? "bg-blue-50/50 hover:bg-blue-100/60" : "bg-white hover:bg-slate-50"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 leading-snug">{text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {unread && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />}
                </div>
              </SwipeableItem>
            );
          })}

          <div className="py-3 flex justify-center min-h-[36px]">
            {isLoading && <span className="text-xs text-slate-400">Зарежда...</span>}
            {!isLoading && !hasMore && notifications.length > 0 && (
              <span className="text-xs text-slate-300">Край на известията</span>
            )}
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );
};

export default NotificationBell;
