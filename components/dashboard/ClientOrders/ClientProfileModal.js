"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal, ModalContent, ModalBody, Button, Chip, Spinner, Tabs, Tab, Textarea } from "@heroui/react";
import { FiPhone, FiShoppingBag, FiDollarSign, FiStar, FiFileText, FiX, FiPlus, FiTrash2, FiUser, FiClock, FiCheck, FiEdit2 } from "react-icons/fi";
import { formatCurrency, formatDate, productTitle } from "@/utils";
import { clientOrderStatusConfig } from "@/data";

const StatBox = ({ icon, label, value, color = "indigo" }) => (
  <div className="bg-white rounded-xl p-3 border border-slate-200 shadow">
    <div className="flex items-center gap-1.5 mb-1">
      <span className={`text-${color}-500`}>{icon}</span>
      <p className={`text-[10px] font-bold text-${color}-500 uppercase tracking-wider`}>{label}</p>
    </div>
    <p className={`text-lg font-bold text-${color}-600 tabular-nums`}>{value}</p>
  </div>
);

const ClientProfileModal = ({ isOpen, onClose, phone, onNameChange }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);

  const fetchProfile = async () => {
    if (!phone) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/client-phones/${encodeURIComponent(phone)}`);
      const json = await res.json();
      setData(json);
    } catch { setData(null); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (isOpen && phone) {
      fetchProfile();
      setNoteText("");
      setEditingName(false);
    }
  }, [isOpen, phone]);

  const saveName = async () => {
    const trimmed = nameValue.trim();
    setSavingName(true);
    try {
      await fetch("/api/client-phones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name: trimmed }),
      });
      setData((prev) => (prev ? { ...prev, name: trimmed } : prev));
      onNameChange?.(phone, trimmed);
      setEditingName(false);
    } finally { setSavingName(false); }
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      await fetch(`/api/client-phones/${encodeURIComponent(phone)}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: noteText.trim() }),
      });
      setNoteText("");
      fetchProfile();
    } finally { setSavingNote(false); }
  };

  const deleteNote = async (id) => {
    await fetch(`/api/client-phones/${encodeURIComponent(phone)}/notes?id=${id}`, { method: "DELETE" });
    fetchProfile();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="2xl" scrollBehavior="inside" backdrop="blur" hideCloseButton>
      <ModalContent>
        {(close) => (
          <ModalBody className="p-0">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                  <FiUser className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  {editingName ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Име на клиента"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                        className="text-sm font-semibold border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 w-full max-w-[200px]"
                      />
                      <button onClick={saveName} disabled={savingName}
                        className="w-6 h-6 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center shrink-0 transition-colors disabled:opacity-50">
                        {savingName ? <Spinner size="sm" color="success" className="scale-75" /> : <FiCheck className="w-3.5 h-3.5 text-green-600" />}
                      </button>
                      <button onClick={() => setEditingName(false)}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors">
                        <FiX className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <p className={`text-sm font-bold truncate ${data?.name ? "text-slate-800" : "text-slate-400 italic"}`}>
                        {data?.name || "Без име"}
                      </p>
                      <button onClick={() => { setNameValue(data?.name || ""); setEditingName(true); }}
                        className="w-5 h-5 rounded-md bg-slate-100 hover:bg-indigo-50 flex items-center justify-center transition-colors shrink-0">
                        <FiEdit2 className="w-3 h-3 text-slate-400 hover:text-indigo-500" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                    <FiPhone className="w-3 h-3" />
                    <span className="tabular-nums">{phone}</span>
                  </div>
                </div>
              </div>
              <button onClick={close} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <FiX className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-16">
                <Spinner size="md" />
              </div>
            )}

            {!loading && data && (
              <div className="p-5 space-y-4">
                {/* Summary stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <StatBox icon={<FiShoppingBag className="w-3.5 h-3.5" />} label="Поръчки" value={data.summary.totalOrders} color="indigo" />
                  <StatBox icon={<FiDollarSign className="w-3.5 h-3.5" />} label="Общо" value={formatCurrency(data.summary.totalRevenue, 2)} color="emerald" />
                  <StatBox icon={<FiCheck className="w-3.5 h-3.5" />} label="Доставени" value={data.summary.delivered} color="sky" />
                  <StatBox icon={<FiX className="w-3.5 h-3.5" />} label="Отказани" value={data.summary.rejected} color="rose" />
                </div>

                {/* Favorite product */}
                {data.favoriteProduct && (
                  <div className="rounded-xl bg-amber-50/40 border border-slate-200 p-3 flex items-center gap-3 shadow">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <FiStar className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Любим продукт</p>
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {productTitle({ name: data.favoriteProduct.name, weight: data.favoriteProduct.weight })}
                      </p>
                      <p className="text-[11px] text-slate-400">{data.favoriteProduct.quantity} бр. в {data.favoriteProduct.orders} поръчки</p>
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <Tabs variant="underlined" color="primary" classNames={{ tabList: "gap-6 p-0", cursor: "w-full bg-indigo-500", panel: "pt-2" }}>
                  <Tab key="notes" title={<span className="flex items-center gap-1.5 text-sm font-semibold"><FiFileText className="w-3.5 h-3.5" /> Бележки {data.notes.length > 0 && <Chip size="sm" variant="flat" className="text-[10px] h-5">{data.notes.length}</Chip>}</span>}>
                    <div className="space-y-2.5">
                      {/* Add note */}
                      <div className="flex items-start gap-2">
                        <Textarea
                          value={noteText}
                          onValueChange={setNoteText}
                          placeholder="Напр. 'Иска винаги Fresh Whip'"
                          minRows={1}
                          maxRows={3}
                          size="sm"
                          className="flex-1"
                        />
                        <Button color="primary" size="sm" radius="lg" isIconOnly isLoading={savingNote} isDisabled={!noteText.trim()} onPress={addNote}>
                          <FiPlus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Notes list */}
                      {data.notes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-300">
                          <FiFileText className="w-8 h-8" />
                          <p className="text-xs font-semibold text-slate-400">Няма бележки</p>
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {data.notes.map((note) => (
                            <li key={note._id} className="group bg-amber-50/40 border border-slate-100 rounded-xl px-3 py-2.5 flex items-start gap-2.5">
                              <FiFileText className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-700 leading-snug whitespace-pre-wrap">{note.text}</p>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                                  {note.createdBy?.name && <span>{note.createdBy.name}</span>}
                                  {note.createdBy?.name && <span>·</span>}
                                  <span>{formatDate(note.createdAt, "DD.MM.YYYY HH:mm")}</span>
                                </div>
                              </div>
                              <button onClick={() => deleteNote(note._id)}
                                className="p-1 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </Tab>

                  <Tab key="orders" title={<span className="flex items-center gap-1.5 text-sm font-semibold"><FiShoppingBag className="w-3.5 h-3.5" /> Поръчки {data.orders.length > 0 && <Chip size="sm" variant="flat" className="text-[10px] h-5">{data.orders.length}</Chip>}</span>}>
                    <div>
                      {data.orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-300">
                          <FiShoppingBag className="w-8 h-8" />
                          <p className="text-xs font-semibold text-slate-400">Няма поръчки</p>
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {data.orders.map((o) => {
                            const cfg = clientOrderStatusConfig[o.status];
                            return (
                              <li key={o._id}>
                                <Link href={`/dashboard/client-orders/${o._id}`} onClick={close}
                                  className="bg-white border border-slate-100 rounded-xl px-3 py-2.5 flex items-center gap-3 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-[11px] font-bold text-slate-400 tabular-nums">#{o.orderNumber}</span>
                                      <Chip size="sm" variant="flat" color={cfg?.color || "default"} className="text-[10px] h-5">{o.status}</Chip>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700 truncate">{productTitle(o.product)} · {o.quantity} бр.</p>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                      <FiClock className="w-3 h-3" />
                                      <span>{formatDate(o.createdAt, "DD.MM.YYYY")}</span>
                                      {o.assignedTo?.name && <span>· {o.assignedTo.name}</span>}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-sm font-bold text-indigo-600 tabular-nums">{formatCurrency(o.quantity * o.price, 2)}</p>
                                  </div>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </Tab>
                </Tabs>
              </div>
            )}
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ClientProfileModal;
