"use client";
import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Button } from "@heroui/react";
import { FaTrash } from "react-icons/fa";
import { HiOutlinePlus } from "react-icons/hi2";
import Modal from "@/components/Modal";
import Input from "@/components/html/Input";
import Select from "@/components/html/Select";
import { productStore } from "@/stores/useStore";

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

  useEffect(() => {
    if (!isOpen) return;
    setData(INITIAL);
    fetch("/api/categories")
      .then((r) => r.json())
      .then((cats) => setCategories(cats))
      .catch(() => {});
  }, [isOpen]);

  const set = (field, value) => setData((prev) => ({ ...prev, [field]: value }));

  const setPrice = (index, value) => {
    const updated = [...data.sell_prices];
    updated[index] = value;
    setData((prev) => ({ ...prev, sell_prices: updated }));
  };

  const setSellerPrice = (index, value) => {
    const updated = [...data.seller_prices];
    updated[index] = value;
    setData((prev) => ({ ...prev, seller_prices: updated }));
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

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Добави продукт"
      isLoading={productStore.isCreating}
      onSave={handleSave}>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Input label="Име" value={data.name} onChange={(v) => set("name", v)} />
          </div>
          <Input label="Вкус" value={data.flavor} onChange={(v) => set("flavor", v)} />
          <Input label="Тегло (г)" type="number" value={data.weight} onChange={(v) => set("weight", v)} />
          <Input label="Цена зареждане" type="number" value={data.price} onChange={(v) => set("price", v)} />
          <Input label="Наличност" type="number" value={data.availability} onChange={(v) => set("availability", v)} />
          <Input label="Бр. в кашон" type="number" value={data.units_per_box} onChange={(v) => set("units_per_box", v)} />
          <Select
            items={categories.map((c) => ({ _id: c._id, name: c.name, value: c._id }))}
            value={data.category}
            onChange={(v) => set("category", v)}
            classes="w-full"
          />
        </div>

        <Input label="URL на снимка" value={data.image_url} onChange={(v) => set("image_url", v)} />

        <div className="border-t border-slate-100 pt-3 space-y-2">
          <p className="text-sm font-semibold text-slate-700">Цени за продажба</p>
          {data.sell_prices.map((price, i) => (
            <div key={i} className="flex items-center gap-2">
              {data.sell_prices.length > 1 && (
                <Button isIconOnly radius="full" color="danger" size="sm"
                  onPress={() => setData((prev) => ({ ...prev, sell_prices: prev.sell_prices.filter((_, j) => j !== i) }))}>
                  <FaTrash className="w-3 h-3" />
                </Button>
              )}
              <Input label={`За ${i + 1} бр.`} type="number" value={price} onChange={(v) => setPrice(i, v)} />
            </div>
          ))}
          <div className="flex justify-center">
            <Button radius="full" color="default" size="sm"
              onPress={() => setData((prev) => ({ ...prev, sell_prices: [...prev.sell_prices, ""] }))}>
              <HiOutlinePlus />
            </Button>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 space-y-2">
          <p className="text-sm font-semibold text-slate-700">Изплащане на доставчик</p>
          {data.seller_prices.map((price, i) => (
            <div key={i} className="flex items-center gap-2">
              {data.seller_prices.length > 1 && (
                <Button isIconOnly radius="full" color="danger" size="sm"
                  onPress={() => setData((prev) => ({ ...prev, seller_prices: prev.seller_prices.filter((_, j) => j !== i) }))}>
                  <FaTrash className="w-3 h-3" />
                </Button>
              )}
              <Input label={`За ${i + 1} бр.`} type="number" value={price} onChange={(v) => setSellerPrice(i, v)} />
            </div>
          ))}
          <div className="flex justify-center">
            <Button radius="full" color="default" size="sm"
              onPress={() => setData((prev) => ({ ...prev, seller_prices: [...prev.seller_prices, ""] }))}>
              <HiOutlinePlus />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default observer(CreateProductModal);
