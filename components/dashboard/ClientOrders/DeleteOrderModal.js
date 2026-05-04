"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { FiAlertTriangle } from "react-icons/fi";
import { productTitle, formatCurrency } from "@/utils";

export default function DeleteOrderModal({
  isOpen,
  onOpenChange,
  order,
  isDeleting = false,
  onConfirm,
}) {
  return (
    <Modal
      placement="center"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{ base: "mx-5 sm:mx-0" }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-2.5 px-4 pb-2">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <FiAlertTriangle className="w-4.5 h-4.5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Изтриване на поръчка</p>
                <p className="text-xs text-slate-400 font-normal">Действието е необратимо.</p>
              </div>
            </ModalHeader>

            <ModalBody className="px-4">
              {order && (
                <div className="bg-slate-50 rounded-xl border border-gray-100 px-3.5 py-3 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-400 tabular-nums">
                      #{order.orderNumber ?? "—"}
                    </span>
                    <span className="text-sm font-semibold text-[#0071f5]">{order.phone}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {productTitle(order.product)}
                    {order.quantity ? ` · ${order.quantity} бр.` : ""}
                  </p>
                  {(order.price || order.secondProduct?.price) && (
                    <p className="text-sm font-bold text-slate-700 tabular-nums">
                      {formatCurrency((order.price || 0) + (order.secondProduct?.price || 0), 2)}
                    </p>
                  )}
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              <Button variant="light" onPress={onClose} isDisabled={isDeleting}>
                Откажи
              </Button>
              <Button
                color="danger"
                isLoading={isDeleting}
                onPress={async () => {
                  const ok = await onConfirm?.();
                  if (ok) onClose();
                }}
              >
                Изтрий
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
