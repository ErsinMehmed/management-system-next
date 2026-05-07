"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import {
  Button,
  Input,
  Accordion,
  AccordionItem,
  Avatar,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import { FiPlus, FiMinus, FiSave, FiPackage, FiCheck } from "react-icons/fi";
import { clientOrderStore, productStore } from "@/stores/useStore";
import { productTitle } from "@/utils";
import { Skeleton, SkeletonListRow } from "@/components/Skeleton";

// ─── Thumbnail за продукт (снимка или fallback икона) ─────────────────────

const ProductThumb = ({ product, size = "md" }) => {
  if (product?.image_url) {
    return (
      <div className="w-10 h-10 shadow rounded-lg overflow-hidden shrink-0 bg-slate-50 border border-slate-200">
        <Image
          src={product.image_url}
          alt={product.name || ""}
          width={38}
          height={38}
          sizes="38px"
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center shrink-0 transition-colors">
      <FiPackage className='w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors' />
    </div>
  );
};

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
        inputMode='numeric'
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
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, si) => (
          <div key={si} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-[#0071f5]/5 to-transparent border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-xl" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
            {Array.from({ length: 4 }).map((_, ri) => (
              <SkeletonListRow key={ri} />
            ))}
          </div>
        ))}
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

  // ── Seller: един плосък list (няма смисъл от акардион, няма и таблица с много колони) ──
  if (!isSuperAdmin && sellers.length === 1) {
    const seller = sellers[0];
    const sid = String(seller.sellerId);
    const sellerValues = values[sid] ?? {};
    const totalStock = visibleProducts.reduce((s, p) => s + (sellerValues[String(p._id)] ?? 0), 0);

    return (
      <div className='flex flex-col gap-4 pb-10'>
        <div className='bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden'>
          <div className='px-5 py-4 bg-gradient-to-r from-indigo-50/40 via-white to-white border-b border-slate-100 flex items-center gap-3'>
            <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20'>
              <FiPackage className='w-4 h-4 text-white' />
            </div>
            <div>
              <p className='text-sm font-bold text-slate-800'>Моята наличност</p>
              <p className='text-[11px] text-slate-400'>{visibleProducts.length} продукта</p>
            </div>
            <Chip size='sm' variant='flat' color={totalStock === 0 ? "danger" : "primary"} className='ml-auto'>
              Общо: {totalStock} бр.
            </Chip>
          </div>

          <div className='divide-y divide-slate-50'>
            {visibleProducts.map((product) => {
              const pid = String(product._id);
              const val = sellerValues[pid] ?? 0;
              return (
                <div key={pid} className='flex items-center gap-3 px-5 py-3 hover:bg-indigo-50/30 transition-colors group'>
                  <ProductThumb product={product} />
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-slate-700 truncate'>{productTitle(product)}</p>
                    {val === 0 && <span className='text-[11px] text-red-400 font-medium'>Изчерпано</span>}
                    {val > 0 && val <= 3 && <span className='text-[11px] text-amber-500 font-medium'>Малко</span>}
                  </div>
                  <Chip size='sm' variant='flat'
                    color={val === 0 ? "danger" : val <= 3 ? "warning" : "success"}
                    classNames={{ base: "min-w-[48px] justify-center font-bold" }}>
                    {val} бр.
                  </Chip>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4 pb-24'>
      {/* ── Десктоп: таблица (матрица) ── */}
      <div className='hidden sm:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden'>
        {/* Header с градиент */}
        <div className='px-5 py-4 bg-gradient-to-r from-indigo-50/40 via-white to-white border-b border-slate-100 flex items-center gap-3'>
          <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20'>
            <FiPackage className='w-4 h-4 text-white' />
          </div>
          <div>
            <p className='text-sm font-bold text-slate-800'>Наличности на доставчици</p>
            <p className='text-[11px] text-slate-400'>Преглед на текущите бройки по продукт</p>
          </div>
          <div className='ml-auto flex items-center gap-2'>
            <Chip size='sm' variant='flat' color='primary' className='font-semibold'>
              {sellers.length} {sellers.length === 1 ? "доставчик" : "доставчици"}
            </Chip>
            <Chip size='sm' variant='flat' className='font-semibold'>
              {visibleProducts.length} продукта
            </Chip>
          </div>
        </div>

        <div className='overflow-x-auto'>
        <Table
          removeWrapper
          aria-label='Наличности по доставчик'
          classNames={{
            th: "bg-slate-50/70 text-slate-500 font-bold text-[10px] uppercase tracking-wider py-3",
            td: "py-3 align-middle",
            tr: "group",
          }}>
          <TableHeader>
            <TableColumn className='w-64 min-w-[180px] pl-5'>Продукт</TableColumn>
            {sellers.map((s) => {
              const initials = s.sellerName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <TableColumn
                  key={String(s.sellerId)}
                  className='text-center min-w-[140px]'>
                  <div className='flex flex-col items-center gap-1.5'>
                    <Avatar
                      name={initials}
                      src={s.profileImage ?? undefined}
                      size='sm'
                      className='bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-xs font-bold ring-2 ring-white shadow-sm'
                    />
                    <span className='font-semibold text-slate-700 normal-case tracking-normal text-xs'>
                      {s.sellerName.split(" ")[0]}
                    </span>
                  </div>
                </TableColumn>
              );
            })}
          </TableHeader>
          <TableBody>
            {visibleProducts.map((product) => {
              const pid = String(product._id);
              return (
                <TableRow
                  key={pid}
                  className='hover:bg-indigo-50/30 transition-colors border-b border-slate-50 last:border-0'>
                  <TableCell className='pl-5'>
                    <div className='flex items-center gap-2.5'>
                      <ProductThumb product={product} size='sm' />
                      <p className='text-sm font-medium text-slate-700 leading-tight'>
                        {productTitle(product)}
                      </p>
                    </div>
                  </TableCell>
                  {sellers.map((seller) => {
                    const sid = String(seller.sellerId);
                    const val = values[sid]?.[pid] ?? 0;
                    const dirty = dirtyMap[sid]?.[pid] ?? false;
                    return (
                      <TableCell
                        key={sid}
                        className='text-center'>
                        <div className='flex justify-center'>
                          <StockCell
                            value={val}
                            onChange={(v) => handleChange(sid, pid, v)}
                            isSuperAdmin={isSuperAdmin}
                            isDirty={dirty}
                          />
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
            {/* Ред с totals */}
            <TableRow className='bg-gradient-to-r from-slate-50 to-white border-t-2 border-indigo-100/60'>
              <TableCell className='pl-5'>
                <span className='text-[11px] font-bold text-indigo-500 uppercase tracking-wider'>
                  Общо
                </span>
              </TableCell>
              {sellers.map((seller) => {
                const sid = String(seller.sellerId);
                const total = visibleProducts.reduce(
                  (s, p) => s + (values[sid]?.[String(p._id)] ?? 0),
                  0,
                );
                return (
                  <TableCell
                    key={sid}
                    className='text-center'>
                    <Chip
                      size='sm'
                      variant='flat'
                      color={total === 0 ? "danger" : "primary"}
                      classNames={{
                        base: "font-bold min-w-[44px] justify-center",
                      }}>
                      {total}
                    </Chip>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
        </div>
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
                        className={`flex items-center gap-2.5 py-2.5 px-1 transition-colors group ${dirty ? "bg-blue-50/30" : ""}`}>
                        <ProductThumb product={product} size='sm' />
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
