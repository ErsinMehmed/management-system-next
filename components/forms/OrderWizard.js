"use client";
import { useState, useEffect } from "react";
import { Button, Chip, Spinner, Tabs, Tab } from "@heroui/react";
import { FiChevronRight, FiChevronLeft, FiCheck, FiPackage, FiCpu, FiSave, FiTrash2, FiBox } from "react-icons/fi";
import Select from "@/components/html/Select";
import Input from "@/components/html/Input";
import Textarea from "@/components/html/Textarea";
import { formatCurrency } from "@/utils";

const STEPS = ["Продукт", "Количество", "Потвърждение"];

const OrderWizard = ({ data, errorFields, updatedProducts, handleFieldChange, setOrderData, products, onSave, isLoading }) => {
  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [boxCount, setBoxCount] = useState("");

  const fetchTemplates = () => {
    fetch("/api/orders/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(Array.isArray(d) ? d : []))
      .catch(() => {});
  };
  useEffect(() => { fetchTemplates(); }, []);

  const selectedProduct = updatedProducts.find((p) => p._id === data.product);
  const unitsPerBox = selectedProduct?.units_per_box || 1;

  // AI препоръка
  useEffect(() => {
    if (!data.product) { setAiSuggestion(null); return; }
    setIsLoadingAi(true);
    fetch(`/api/orders/suggest?productId=${data.product}`)
      .then((r) => r.json())
      .then((d) => setAiSuggestion(d))
      .catch(() => setAiSuggestion(null))
      .finally(() => setIsLoadingAi(false));
  }, [data.product]);

  // Sync box ↔ quantity
  const handleQtyChange = (val) => {
    handleFieldChange("quantity", val);
    setBoxCount(val && unitsPerBox ? (Number(val) / unitsPerBox).toFixed(1).replace(/\.0$/, "") : "");
  };

  const handleBoxChange = (val) => {
    setBoxCount(val);
    const qty = val ? Math.round(Number(val) * unitsPerBox) : "";
    handleFieldChange("quantity", String(qty));
  };

  const applyTemplate = (tpl) => {
    const productId = tpl.product?._id || tpl.product;
    const prod = (products || updatedProducts).find((p) => p._id === productId);
    const price = prod?.price || 0;
    const qty = Number(tpl.quantity);
    const upb = prod?.units_per_box || 1;

    setOrderData({
      product: productId,
      quantity: qty,
      price: price,
      total_amount: price * qty,
      message: tpl.message || "",
      date: "",
    });
    setBoxCount((qty / upb).toFixed(1).replace(/\.0$/, ""));
    setStep(2);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return;
    const res = await fetch("/api/orders/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: templateName.trim(), product: data.product, quantity: Number(data.quantity), message: data.message || "" }),
    });
    if (res.ok) {
      setTemplateName("");
      setShowSaveTemplate(false);
      fetchTemplates();
    }
  };

  const deleteTemplate = async (id) => {
    await fetch(`/api/orders/templates?id=${id}`, { method: "DELETE" });
    fetchTemplates();
  };

  const canNext = () => {
    if (step === 0) return !!data.product;
    if (step === 1) return !!data.quantity && Number(data.quantity) > 0;
    return true;
  };

  const handleNext = () => {
    if (step < 2 && canNext()) setStep(step + 1);
    if (step === 2) return onSave();
  };

  const cartons = data.quantity && unitsPerBox ? (Number(data.quantity) / unitsPerBox) : 0;

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div className="flex items-center px-4 mt-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <button
              onClick={() => { if (i < step) setStep(i); }}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 transition-all duration-300 ${
                i < step ? "bg-indigo-500 text-white cursor-pointer" :
                i === step ? "bg-indigo-600 text-white" :
                "bg-slate-100 text-slate-400"
              }`}>
              {i < step ? <FiCheck className="w-3 h-3" /> : i + 1}
            </button>
            <span className={`text-[11px] font-semibold ml-1 ${i === step ? "text-slate-700" : i < step ? "text-indigo-500" : "text-slate-400"}`}>{s}</span>
            {i < 2 && <div className={`flex-1 h-px mx-1 ${i < step ? "bg-indigo-300" : "bg-slate-200/80"}`} />}
          </div>
        ))}
      </div>

      {/* Templates */}
      {step === 0 && templates.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Шаблони</p>
          <div className="flex flex-wrap gap-2">
            {templates.map((tpl) => (
              <div key={tpl._id} className="group flex items-center bg-white rounded-xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-sm transition-all">
                <button onClick={() => applyTemplate(tpl)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                  <FiPackage className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{tpl.name}</span>
                  <Chip size="sm" variant="flat" className="text-[10px]">{tpl.quantity} бр.</Chip>
                </button>
                <button onClick={() => deleteTemplate(tpl._id)}
                  className="px-2 py-2 text-slate-300 hover:text-red-500 transition-colors border-l border-slate-100 opacity-0 group-hover:opacity-100">
                  <FiTrash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Product */}
      {step === 0 && (
        <div className="space-y-4">
          <Select
            items={updatedProducts}
            label="Избери продукт"
            value={data.product || ""}
            errorMessage={errorFields.product}
            onChange={(value) => handleFieldChange("product", value)}
          />

          {selectedProduct && (
            <div className="rounded-xl border border-indigo-100/60 bg-gradient-to-br from-indigo-50/40 to-white p-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <FiPackage className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-sm font-bold text-slate-800">{selectedProduct.name}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="bg-blue-50 rounded-lg px-3 py-2.5 text-center border border-blue-200">
                  <p className="text-[10px] font-bold text-slate-600 uppercase">Цена</p>
                  <p className="text-sm font-bold text-slate-700 tabular-nums">{formatCurrency(selectedProduct.price, 2)}</p>
                </div>
                <div className="bg-blue-50 rounded-lg px-3 py-2.5 text-center border border-blue-200">
                  <p className="text-[10px] font-bold text-slate-600 uppercase">Наличност</p>
                  <Chip size="sm" variant="flat" color={selectedProduct.availability < 10 ? "danger" : selectedProduct.availability < 30 ? "warning" : "success"} className="mt-0.5">
                    {selectedProduct.availability} бр.
                  </Chip>
                </div>
                <div className="bg-blue-50 rounded-lg px-3 py-2.5 text-center border border-blue-200">
                  <p className="text-[10px] font-bold text-slate-600 uppercase">В кашон</p>
                  <p className="text-sm font-bold text-slate-700">{selectedProduct.units_per_box || "—"} бр.</p>
                </div>
              </div>

              {/* AI suggestion */}
              {isLoadingAi && (
                <div className="flex items-center gap-2 pt-1">
                  <Spinner size="sm" />
                  <span className="text-xs text-slate-400">AI анализира последните поръчки...</span>
                </div>
              )}
              {aiSuggestion && !isLoadingAi && (
                <div className="bg-blue-50 rounded-lg px-3.5 py-2.5 border-blue-50 flex items-center gap-3 mt-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <FiCpu className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-indigo-600">Препоръка: {aiSuggestion.suggested} бр.</p>
                    <p className="text-[11px] text-slate-400 truncate">{aiSuggestion.reason}</p>
                  </div>
                  <Button size="sm" variant="flat" color="primary" radius="full" className="shrink-0 font-semibold text-xs"
                    onPress={() => { handleQtyChange(String(aiSuggestion.suggested)); setStep(1); }}>
                    Приложи
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Quantity */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
              <FiPackage className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <span className="text-sm font-bold text-slate-700">{selectedProduct?.name}</span>
            <span className="text-xs text-slate-400 ml-auto tabular-nums">{formatCurrency(selectedProduct?.price, 2)} / бр.</span>
          </div>

          {/* Quantity / Box inputs */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              label="Бройки"
              value={data.quantity || ""}
              errorMessage={errorFields.quantity}
              onChange={handleQtyChange}
            />
            <Input
              type="number"
              label={`Кашони (×${unitsPerBox})`}
              value={boxCount}
              onChange={handleBoxChange}
            />
          </div>

          <Input type="date" label="Дата (по избор)" value={data.date || ""} onChange={(v) => handleFieldChange("date", v)} />

          <Textarea label="Бележка (по избор)" value={data.message || ""} onChange={(v) => handleFieldChange("message", v)} />

          {/* Summary */}
          {Number(data.quantity) > 0 && (
            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-50/30 p-4 text-center border border-indigo-100/50">
              <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Обща сума</p>
              <p className="text-xl font-bold text-indigo-600 tabular-nums">{formatCurrency(data.total_amount || 0, 2)}</p>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-blue-50 overflow-hidden">
            <div className="px-4 py-2.5">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Преглед</p>
            </div>
            <div className="rounded-lg mx-3 mb-3">
              {[
                ["Продукт", selectedProduct?.name],
                ["Количество", `${data.quantity} бр.`],
                ["Кашони", cartons.toFixed(1) + ' бр.'],
                ["Ед. цена", formatCurrency(data.price, 2)],
                ...(data.message ? [["Бележка", data.message]] : []),
              ].map(([label, val], i) => (
                <div key={i} className="flex items-center font-semibold justify-between px-4 py-2.5">
                  <span className="text-[13px] text-slate-600">{label}</span>
                  <span className="text-[13px] text-slate-700">{val}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3 bg-indigo-50/50 rounded-b-lg">
                <span className="text-sm font-bold text-indigo-600">Обща сума</span>
                <span className="text-lg font-bold text-indigo-600 tabular-nums">{formatCurrency(data.total_amount, 2)}</span>
              </div>
            </div>
          </div>

          {/* Save template */}
          {!showSaveTemplate ? (
            <Button size="sm" variant="light" radius="full" className="font-semibold text-xs text-slate-400"
              startContent={<FiSave className="w-3.5 h-3.5" />}
              onPress={() => setShowSaveTemplate(true)}>
              Запази като шаблон
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3">
              <Input label="Име на шаблон" value={templateName} onChange={setTemplateName} />
              <Button size="sm" radius="lg" color="primary" className="shrink-0 font-semibold bg-indigo-600"
                isDisabled={!templateName.trim()}
                onPress={handleSaveTemplate}>
                Запази
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="flat" radius="lg" className="font-semibold"
          isDisabled={step === 0}
          startContent={<FiChevronLeft className="w-4 h-4" />}
          onPress={() => setStep(step - 1)}>
          Назад
        </Button>

        <Button color="primary" radius="lg"
          className="font-semibold bg-indigo-600 hover:bg-indigo-700 px-6"
          isDisabled={!canNext()}
          isLoading={step === 2 && isLoading}
          endContent={step < 2 ? <FiChevronRight className="w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
          onPress={handleNext}>
          {step < 2 ? "Напред" : "Потвърди поръчката"}
        </Button>
      </div>
    </div>
  );
};

export default OrderWizard;
