"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  Button,
  Input,
  Accordion,
  AccordionItem,
  Avatar,
  Chip,
} from "@heroui/react";
import { FiPlus, FiMinus, FiSave, FiPackage, FiCheck } from "react-icons/fi";
import { clientOrderStore, productStore } from "@/stores/useStore";
import { productTitle } from "@/utils";

// ─── Единична клетка за стойност ───────────────────────────────────────────

const StockCell = ({ value, onChange, isSuperAdmin, isDirty }) => {
  if (!isSuperAdmin) {
    return (
      <Chip
        size='sm'
        variant='flat'
        color={value === 0 ? "danger" : value <= 3 ? "warning" : "success"}
        classNames={{ base: "min-w-[36px] justify-center font-bold" }}>
        {value}
      </Chip>
    );
  }

  return (
    <div
      className={`flex items-center gap-1 rounded-xl transition-all ${isDirty ? "ring-2 ring-[#0071f5]/30 bg-blue-50/50" : ""}`}>
      <Button
        isIconOnly
        size='sm'
        variant='light'
        className='w-7 h-7 min-w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg'
        onPress={() => onChange(Math.max(0, value - 1))}>
        <FiMinus className='w-3 h-3' />
      </Button>
      <Input
        type='number'
        min={0}
        value={String(value)}
        onValueChange={(v) => onChange(Math.max(0, parseInt(v) || 0))}
        classNames={{
          base: "w-14",
          inputWrapper: `h-7 min-h-7 rounded-lg shadow-none px-1 border ${isDirty ? "border-[#0071f5]/40 bg-white" : "border-slate-200 bg-slate-50"}`,
          input: "text-center text-sm font-bold text-slate-800",
        }}
      />
      <Button
        isIconOnly
        size='sm'
        variant='light'
        className='w-7 h-7 min-w-7 text-[#0071f5] hover:bg-blue-100 rounded-lg'
        onPress={() => onChange(value + 1)}>
        <FiPlus className='w-3 h-3' />
      </Button>
    </div>
  );
};

// ─── Главен компонент ───────────────────────────────────────────────────────

const ClientOrdersStockTab = ({ isSuperAdmin }) => {
  const { stock, isStockLoading } = clientOrderStore;
  const { products } = productStore;

  const visibleProducts = useMemo(
    () => products.filter((p) => !p.hidden),
    [products],
  );

  // values: { sellerId: { productId: number } }
  const [values, setValues] = useState({});
  // dirtyMap: { sellerId: { productId: bool } }
  const [dirtyMap, setDirtyMap] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  // Инициализираме при зареждане на данните
  useEffect(() => {
    if (!stock?.sellers) return;
    const init = {};
    for (const seller of stock.sellers) {
      const sid = String(seller.sellerId);
      init[sid] = {};
      for (const p of visibleProducts) init[sid][String(p._id)] = 0;
      for (const s of seller.products) init[sid][String(s.productId)] = s.stock;
    }
    setValues(init);
    setDirtyMap({});
  }, [stock?.sellers, visibleProducts]);

  const handleChange = useCallback((sellerId, productId, val) => {
    setValues((prev) => ({
      ...prev,
      [sellerId]: { ...prev[sellerId], [productId]: val },
    }));
    setDirtyMap((prev) => ({
      ...prev,
      [sellerId]: { ...prev[sellerId], [productId]: true },
    }));
    setSavedAt(null);
  }, []);

  const totalDirty = useMemo(
    () =>
      Object.values(dirtyMap).reduce(
        (sum, m) => sum + Object.values(m).filter(Boolean).length,
        0,
      ),
    [dirtyMap],
  );

  const handleSaveAll = async () => {
    setSaving(true);
    const sellers = stock?.sellers ?? [];
    await Promise.all(
      sellers.map((seller) => {
        const sid = String(seller.sellerId);
        const sellerValues = values[sid] ?? {};
        const productsList = Object.entries(sellerValues).map(
          ([productId, stock]) => ({ productId, stock }),
        );
        return clientOrderStore.saveSellerStock(sid, productsList);
      }),
    );
    setSaving(false);
    setDirtyMap({});
    setSavedAt(Date.now());
  };

  // ── Зареждане ──
  if (isStockLoading) {
    return (
      <div className='flex flex-col items-center justify-center py-16 gap-3'>
        <div className='w-8 h-8 rounded-full border-2 border-[#0071f5] border-t-transparent animate-spin' />
        <span className='text-sm text-slate-400 font-medium'>Зареждане...</span>
      </div>
    );
  }

  const sellers = stock?.sellers ?? [];

  if (sellers.length === 0 || visibleProducts.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 gap-2'>
        <div className='w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-1'>
          <FiPackage className='w-6 h-6 text-slate-300' />
        </div>
        <p className='text-sm font-semibold text-slate-400'>
          Няма данни за наличности
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4 pb-24'>
      {/* ── Десктоп: таблица (матрица) ── */}
      <div className='hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto'>
        <table className='min-w-full' aria-label='Наличности по доставчик'>
          <thead>
            <tr>
              <th className='w-48 min-w-[160px] bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wide py-3 px-4 text-left first:rounded-tl-2xl'>
                Продукт
              </th>
              {sellers.map((s) => {
                const initials = s.sellerName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <th
                    key={String(s.sellerId)}
                    className='text-center min-w-[140px] bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wide py-3 px-4 last:rounded-tr-2xl'>
                    <div className='flex flex-col items-center gap-1'>
                      <Avatar
                        name={initials}
                        src={s.profileImage ?? undefined}
                        size='sm'
                        className='bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xs font-bold'
                      />
                      <span className='font-semibold text-slate-700 normal-case tracking-normal text-xs'>
                        {s.sellerName.split(" ")[0]}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visibleProducts.map((product) => {
              const pid = String(product._id);
              return (
                <tr
                  key={pid}
                  className='hover:bg-slate-50/60 transition-colors group'>
                  <td className='py-2.5 px-4 align-middle'>
                    <p className='text-sm font-medium text-slate-700 leading-tight'>
                      {productTitle(product)}
                    </p>
                  </td>
                  {sellers.map((seller) => {
                    const sid = String(seller.sellerId);
                    const val = values[sid]?.[pid] ?? 0;
                    const dirty = dirtyMap[sid]?.[pid] ?? false;
                    return (
                      <td
                        key={sid}
                        className='py-2.5 px-4 align-middle text-center'>
                        <div className='flex justify-center'>
                          <StockCell
                            value={val}
                            onChange={(v) => handleChange(sid, pid, v)}
                            isSuperAdmin={isSuperAdmin}
                            isDirty={dirty}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {/* Ред с totals */}
            <tr className='border-t-2 border-slate-100'>
              <td className='py-2.5 px-4 align-middle'>
                <span className='text-xs font-bold text-slate-500 uppercase tracking-wide'>
                  Общо
                </span>
              </td>
              {sellers.map((seller) => {
                const sid = String(seller.sellerId);
                const total = visibleProducts.reduce(
                  (s, p) => s + (values[sid]?.[String(p._id)] ?? 0),
                  0,
                );
                return (
                  <td
                    key={sid}
                    className='py-2.5 px-4 align-middle text-center'>
                    <Chip
                      size='sm'
                      variant='flat'
                      color={total === 0 ? "danger" : "primary"}
                      classNames={{
                        base: "font-bold min-w-[40px] justify-center",
                      }}>
                      {total}
                    </Chip>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Мобилен: акордеон ── */}
      <div className='sm:hidden'>
        <Accordion
          variant='splitted'
          selectionMode='multiple'
          itemClasses={{
            base: "bg-white shadow-sm border border-gray-100 rounded-2xl px-0",
            title: "py-0",
            trigger: "px-4 py-3",
            content: "px-4 pt-0 pb-3",
          }}>
          {sellers.map((seller) => {
            const sid = String(seller.sellerId);
            const sellerValues = values[sid] ?? {};
            const totalStock = visibleProducts.reduce(
              (s, p) => s + (sellerValues[String(p._id)] ?? 0),
              0,
            );
            const dirtyCount = Object.values(dirtyMap[sid] ?? {}).filter(
              Boolean,
            ).length;
            const initials = seller.sellerName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <AccordionItem
                key={sid}
                textValue={seller.sellerName}
                title={
                  <div className='flex items-center gap-2.5'>
                    <Avatar
                      name={initials}
                      src={seller.profileImage ?? undefined}
                      size='sm'
                      className='bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xs font-bold flex-shrink-0'
                    />
                    <span className='font-semibold text-slate-800 text-sm'>
                      {seller.sellerName}
                    </span>
                    <div className='flex items-center gap-1.5 ml-auto pr-2'>
                      {dirtyCount > 0 && (
                        <Chip
                          size='sm'
                          color='primary'
                          variant='dot'
                          className='text-xs'>
                          {dirtyCount} промени
                        </Chip>
                      )}
                      <Chip
                        size='sm'
                        variant='flat'
                        color={totalStock === 0 ? "danger" : "default"}
                        classNames={{ base: "font-semibold" }}>
                        {totalStock} бр.
                      </Chip>
                    </div>
                  </div>
                }>
                <div className='flex flex-col divide-y divide-slate-50'>
                  {visibleProducts.map((product) => {
                    const pid = String(product._id);
                    const val = sellerValues[pid] ?? 0;
                    const dirty = dirtyMap[sid]?.[pid] ?? false;
                    return (
                      <div
                        key={pid}
                        className={`flex items-center justify-between py-2.5 px-1 transition-colors ${dirty ? "bg-blue-50/30" : ""}`}>
                        <div className='min-w-0 flex-1 pr-3'>
                          <p className='text-sm text-slate-700 truncate'>
                            {productTitle(product)}
                          </p>
                          {val === 0 && (
                            <span className='text-[11px] text-red-400 font-medium'>
                              Изчерпано
                            </span>
                          )}
                          {val > 0 && val <= 3 && (
                            <span className='text-[11px] text-amber-500 font-medium'>
                              Малко
                            </span>
                          )}
                        </div>
                        <StockCell
                          value={val}
                          onChange={(v) => handleChange(sid, pid, v)}
                          isSuperAdmin={isSuperAdmin}
                          isDirty={dirty}
                        />
                      </div>
                    );
                  })}
                </div>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* ── Sticky save bar ── */}
      {isSuperAdmin && (
        <div
          className={`fixed bottom-[75px] sm:bottom-4 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:w-fit z-40 transition-all duration-300 ${
            totalDirty > 0 || savedAt
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0 pointer-events-none"
          }`}>
          <div className='sm:rounded-2xl bg-white sm:shadow-xl border-t sm:border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-lg'>
            {savedAt && totalDirty === 0 ? (
              <span className='flex items-center gap-2 text-sm font-semibold text-emerald-600'>
                <FiCheck className='w-4 h-4' />
                Всички промени са запазени
              </span>
            ) : (
              <>
                <span className='text-sm text-slate-500'>
                  <span className='font-bold text-slate-800'>{totalDirty}</span>{" "}
                  незапазени промени
                </span>
                <Button
                  size='sm'
                  color='primary'
                  onPress={handleSaveAll}
                  isLoading={saving}
                  startContent={!saving && <FiSave className='w-3.5 h-3.5' />}
                  className='rounded-xl font-semibold px-5'>
                  Запази всички
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(ClientOrdersStockTab);
