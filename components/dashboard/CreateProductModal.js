"use client";
import { useState, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { Modal, ModalContent, ModalBody, Button, Tabs, Tab, Spinner, Chip } from "@heroui/react";
import { FiUpload, FiX, FiImage, FiDollarSign, FiPackage, FiTag, FiTrash2, FiPlus, FiInfo, FiCheck } from "react-icons/fi";
import Input from "@/components/html/Input";
import Select from "@/components/html/Select";
import { productStore, commonStore } from "@/stores/useStore";

const CLOUDINARY_CLOUD = "dhp0zcdke";
const CLOUDINARY_PRESET = "ep0eopza";

const INITIAL = {
  name: "",
  flavor: "",
  weight: "",
  price: "",
  availability: "0",
  units_per_box: "",
  sell_prices: [""],
  seller_prices: [""],
  category: "",
  image_url: "",
  hidden: false,
};

const CreateProductModal = ({ isOpen, onOpenChange }) => {
  const [data, setData] = useState(INITIAL);
  const [categories, setCategories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setData(INITIAL);
    fetch("/api/categories")
      .then((r) => r.json())
      .then((cats) => setCategories(cats))
      .catch(() => {});
  }, [isOpen]);

  const set = (field, value) => setData((prev) => ({ ...prev, [field]: value }));

  const uploadImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      commonStore.setErrorMessage("Моля качи валидна снимка.");
      return;
    }
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", CLOUDINARY_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
        method: "POST", body: form,
      });
      const json = await res.json();
      if (!json.secure_url) throw new Error("Upload failed");
      set("image_url", json.secure_url);
    } catch {
      commonStore.setErrorMessage("Грешка при качване на снимката.");
    } finally { setIsUploading(false); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    uploadImage(e.dataTransfer.files?.[0]);
  };

  const handleSave = async () => {
    const payload = {
      ...data,
      price: parseFloat(data.price) || 0,
      availability: parseFloat(data.availability) || 0,
      weight: data.weight ? parseFloat(data.weight) : undefined,
      units_per_box: data.units_per_box ? parseFloat(data.units_per_box) : undefined,
      sell_prices: data.sell_prices.map(Number).filter(Boolean),
      seller_prices: data.seller_prices.map(Number).filter(Boolean),
    };
    const ok = await productStore.createProduct(payload);
    if (ok) onOpenChange(false);
  };

  const addRow = (field) => setData((p) => ({ ...p, [field]: [...p[field], ""] }));
  const removeRow = (field, i) => setData((p) => ({ ...p, [field]: p[field].filter((_, j) => j !== i) }));
  const updateRow = (field, i, v) => setData((p) => {
    const arr = [...p[field]]; arr[i] = v; return { ...p, [field]: arr };
  });

  const hasBasicInfo = data.name && data.price && data.category;
  const completedSections = [
    !!data.image_url,
    hasBasicInfo,
    data.sell_prices.filter(Boolean).length > 0,
  ].filter(Boolean).length;

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl"
      scrollBehavior="inside" backdrop="blur" hideCloseButton
      classNames={{ base: "max-h-[90vh]" }}>
      <ModalContent>
        {(close) => (
          <ModalBody className="p-0">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <FiPackage className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Нов продукт</p>
                  <p className="text-[11px] text-slate-400">Стъпка {completedSections}/3 попълнена</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={`w-8 h-1 rounded-full transition-colors ${i < completedSections ? "bg-indigo-500" : "bg-slate-200"}`} />
                  ))}
                </div>
                <button onClick={close} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <FiX className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-5 pt-3">
              <Tabs variant="underlined" color="primary"
                classNames={{ tabList: "gap-6 p-0", cursor: "w-full bg-indigo-500", panel: "pt-4" }}>
                {/* ── Основна информация ── */}
                <Tab key="info" title={
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <FiInfo className="w-3.5 h-3.5" /> Информация
                    {hasBasicInfo && <FiCheck className="w-3 h-3 text-emerald-500" />}
                  </span>
                }>
                  <div className="space-y-4 pb-2">
                    {/* Image upload */}
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Снимка на продукта</p>
                      {data.image_url ? (
                        <div className="relative group rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 aspect-video max-w-[280px]">
                          <Image src={data.image_url} alt="preview" fill sizes="280px"
                            className="object-contain p-3" unoptimized />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <Button size="sm" variant="flat" color="default" radius="lg"
                              className="font-semibold bg-white"
                              startContent={<FiUpload className="w-3.5 h-3.5" />}
                              onPress={() => fileInputRef.current?.click()}>
                              Смени
                            </Button>
                            <Button size="sm" variant="flat" color="danger" radius="lg"
                              className="font-semibold"
                              startContent={<FiTrash2 className="w-3.5 h-3.5" />}
                              onPress={() => set("image_url", "")}>
                              Премахни
                            </Button>
                          </div>
                          {isUploading && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                              <Spinner />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleDrop}
                          className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all aspect-video max-w-[280px] flex flex-col items-center justify-center gap-2 ${
                            isDragging
                              ? "border-indigo-400 bg-indigo-50/60"
                              : "border-slate-200 bg-slate-50/60 hover:border-indigo-200 hover:bg-indigo-50/30"
                          }`}>
                          {isUploading ? (
                            <Spinner />
                          ) : (
                            <>
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
                                <FiImage className="w-5 h-5 text-white" />
                              </div>
                              <div className="text-center px-4">
                                <p className="text-sm font-semibold text-slate-700">Качи снимка</p>
                                <p className="text-[11px] text-slate-400">Пусни тук или кликни · PNG, JPG, WebP</p>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => uploadImage(e.target.files?.[0])} />
                    </div>

                    {/* Name — full width */}
                    <Input label="Име на продукта" value={data.name} onChange={(v) => set("name", v)} />

                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Вкус" value={data.flavor} onChange={(v) => set("flavor", v)} />
                      <Select
                        items={categories.map((c) => ({ _id: c._id, name: c.name, value: c._id }))}
                        label="Категория"
                        value={data.category}
                        onChange={(v) => set("category", v)}
                      />
                      <Input label="Тегло (г)" type="number" value={data.weight} onChange={(v) => set("weight", v)} />
                      <Input label="Бр. в кашон" type="number" inputMode="numeric" value={data.units_per_box} onChange={(v) => set("units_per_box", v)} />
                    </div>

                    <div className="rounded-xl bg-amber-50/40 border border-amber-100/70 p-3 flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                        <FiDollarSign className="w-3 h-3 text-amber-600" />
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <Input label="Цена на зареждане (€)" type="number" value={data.price} onChange={(v) => set("price", v)} />
                        <Input label="Наличност" type="number" inputMode="numeric" value={data.availability} onChange={(v) => set("availability", v)} />
                      </div>
                    </div>
                  </div>
                </Tab>

                {/* ── Ценообразуване ── */}
                <Tab key="pricing" title={
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <FiTag className="w-3.5 h-3.5" /> Ценообразуване
                    {data.sell_prices.filter(Boolean).length > 0 && <FiCheck className="w-3 h-3 text-emerald-500" />}
                  </span>
                }>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                    {/* Sell prices */}
                    <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                          <FiDollarSign className="w-3.5 h-3.5 text-white" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">Цени за продажба</p>
                        <Chip size="sm" variant="flat" color="success" className="ml-auto text-[10px] h-5">
                          {data.sell_prices.filter(Boolean).length}
                        </Chip>
                      </div>
                      <p className="text-[11px] text-slate-400 -mt-1">Цена за клиента според брой</p>
                      {data.sell_prices.map((price, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input label={`За ${i + 1} бр.`} type="number" value={price} onChange={(v) => updateRow("sell_prices", i, v)} />
                          {data.sell_prices.length > 1 && (
                            <Button isIconOnly radius="lg" variant="flat" color="danger" size="sm"
                              className="shrink-0"
                              onPress={() => removeRow("sell_prices", i)}>
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="flat" size="sm" radius="lg" className="w-full font-semibold"
                        startContent={<FiPlus className="w-3.5 h-3.5" />}
                        onPress={() => addRow("sell_prices")}>
                        Добави цена
                      </Button>
                    </div>

                    {/* Seller prices */}
                    <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                          <FiDollarSign className="w-3.5 h-3.5 text-white" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">Изплащане на доставчик</p>
                        <Chip size="sm" variant="flat" color="primary" className="ml-auto text-[10px] h-5">
                          {data.seller_prices.filter(Boolean).length}
                        </Chip>
                      </div>
                      <p className="text-[11px] text-slate-400 -mt-1">Комисия за seller-а според брой</p>
                      {data.seller_prices.map((price, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input label={`За ${i + 1} бр.`} type="number" value={price} onChange={(v) => updateRow("seller_prices", i, v)} />
                          {data.seller_prices.length > 1 && (
                            <Button isIconOnly radius="lg" variant="flat" color="danger" size="sm"
                              className="shrink-0"
                              onPress={() => removeRow("seller_prices", i)}>
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="flat" size="sm" radius="lg" className="w-full font-semibold"
                        startContent={<FiPlus className="w-3.5 h-3.5" />}
                        onPress={() => addRow("seller_prices")}>
                        Добави цена
                      </Button>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/40">
              <p className="text-[11px] text-slate-400">
                {hasBasicInfo ? "Готов за запазване" : "Попълни задължителните полета"}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="flat" radius="lg" className="font-semibold" onPress={close}>
                  Отказ
                </Button>
                <Button color="primary" radius="lg" className="font-semibold px-5"
                  isDisabled={!hasBasicInfo || isUploading}
                  isLoading={productStore.isCreating}
                  onPress={handleSave}>
                  Запази продукта
                </Button>
              </div>
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

export default observer(CreateProductModal);
