import Input from "@/components/html/Input";
import Select from "@/components/html/Select";
import Textarea from "@/components/html/Textarea";
import {Switch} from "@heroui/react";
import {FaViber, FaWhatsapp} from "react-icons/fa";

const ClientOrderForm = ({data, errorFields, products, sellers = [], handleFieldChange}) => {
    return (
        <div className="space-y-3.5 mt-2.5">
            <Input
                type="text"
                label="Телефон на клиента"
                value={data.phone || ""}
                errorMessage={errorFields?.phone}
                onChange={(value) => handleFieldChange("phone", value)}
            />

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
                errorMessage={errorFields?.price}
                onChange={(value) => handleFieldChange("price", value)}
            />

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
                                isSelected={isSelected}
                                isDisabled={isDisabled}
                                onValueChange={(val) => handleFieldChange("contactMethod", val ? method : "")}
                            />
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
