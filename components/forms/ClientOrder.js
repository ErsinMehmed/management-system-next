import { useState } from "react";
import Input from "@/components/html/Input";
import Select from "@/components/html/Select";
import Textarea from "@/components/html/Textarea";
import {Switch} from "@heroui/react";
import {FaViber, FaWhatsapp} from "react-icons/fa";
import { FiPlus, FiX, FiPackage } from "react-icons/fi";

const ClientOrderForm = ({data, errorFields, products, sellers = [], handleFieldChange}) => {
    const [showSecond, setShowSecond] = useState(!!data.product2);

    const handleRemoveSecond = () => {
        setShowSecond(false);
        handleFieldChange("product2", "");
        handleFieldChange("quantity2", "");
    };

    return (
        <div className="space-y-3.5 mt-2.5">
            <Input
                type="text"
                label="Телефон на клиента"
                value={data.phone || ""}
                errorMessage={errorFields?.phone}
                onChange={(value) => handleFieldChange("phone", value)}
            />

            {/* Първи продукт */}
            <Select
                items={products}
                label="Избери продукт"
                value={data.product || ""}
                errorMessage={errorFields?.product}
                onChange={(value) => handleFieldChange("product", value)}
            />

            <Input
                type="number"
                label="Брой"
                value={data.quantity || ""}
                disabled={!data.product}
                errorMessage={errorFields?.quantity}
                onChange={(value) => handleFieldChange("quantity", value)}
            />

            <Input
                type="number"
                label="Цена"
                value={data.price || ""}
                disabled={!data.quantity}
                errorMessage={errorFields?.price}
                onChange={(value) => handleFieldChange("price", value)}
            />

            {/* Втори продукт */}
            {showSecond ? (
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3.5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FiPackage className="w-3.5 h-3.5 text-[#0071f5]" />
                            <span className="text-xs font-semibold text-[#0071f5]">Втори продукт</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemoveSecond}
                            className="w-6 h-6 rounded-full bg-slate-100 hover:bg-red-100 flex items-center justify-center transition-colors">
                            <FiX className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                        </button>
                    </div>
                    <Select
                        items={products.filter((p) => p._id !== data.product)}
                        label="Избери втори продукт"
                        value={data.product2 || ""}
                        onChange={(value) => handleFieldChange("product2", value)}
                    />
                    <Input
                        type="number"
                        label="Брой"
                        value={data.quantity2 || ""}
                        disabled={!data.product2}
                        onChange={(value) => handleFieldChange("quantity2", value)}
                    />
                    <Input
                        type="number"
                        label="Цена"
                        value={data.price2 || ""}
                        disabled={!data.product2}
                        onChange={(value) => handleFieldChange("price2", value)}
                    />
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setShowSecond(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-200 text-slate-400 hover:border-[#0071f5]/40 hover:text-[#0071f5] hover:bg-blue-50/30 transition-all text-sm font-medium">
                    <FiPlus className="w-4 h-4" />
                    Добави втори продукт
                </button>
            )}

            <Input
                type="text"
                label="Адрес (по избор)"
                value={data.address || ""}
                onChange={(value) => handleFieldChange("address", value)}
            />

            <Textarea
                label="Бележка (по избор)"
                value={data.note || ""}
                onChange={(value) => handleFieldChange("note", value)}
            />

            {/* Начин на връзка — два toggle-а, взаимно изключващи се */}
            <div className="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                {[
                    {method: "Viber", Icon: FaViber, color: "text-[#7360F2]", bg: "bg-[#7360F2]/10"},
                    {method: "WhatsApp", Icon: FaWhatsapp, color: "text-[#25D366]", bg: "bg-[#25D366]/10"},
                ].map(({method, Icon, color, bg}) => {
                    const isSelected = data.contactMethod === method;
                    const isDisabled = !!data.contactMethod && !isSelected;
                    return (
                        <div key={method}
                             className={`flex items-center justify-between px-3.5 py-3 transition-colors ${isSelected ? "bg-slate-50" : ""}`}>
                            <div className="flex items-center gap-2.5">
                                <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? bg : "bg-slate-100"}`}>
                                    <Icon className={`w-3.5 h-3.5 ${isSelected ? color : "text-slate-400"}`}/>
                                </div>
                                <p className={`text-sm font-medium ${isSelected ? "text-slate-800" : "text-slate-500"}`}>{method}</p>
                            </div>
                            <Switch
                                size="sm"
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={(val) => handleFieldChange("contactMethod", val ? method : "")}
                            >
                                <Switch.Control>
                                    <Switch.Thumb />
                                </Switch.Control>
                            </Switch>
                        </div>
                    );
                })}
            </div>

            <Input
                type="number"
                label="Цена за доставка (по избор)"
                value={data.deliveryCost || ""}
                onChange={(value) => handleFieldChange("deliveryCost", value)}
            />

            {sellers.length > 0 && (
                <Select
                    items={sellers}
                    label="Избери доставчик"
                    value={data.assignedTo || ""}
                    errorMessage={errorFields?.assignedTo}
                    onChange={(value) => handleFieldChange("assignedTo", value)}
                />
            )}
        </div>
    );
};

export default ClientOrderForm;
