"use client";
import { Modal } from "@heroui/react";

const ConfirmModal = ({
  isOpen,
  onOpenChange,
  title,
  message,
  onConfirm,
  confirmText = "Изтрий",
  cancelText = "Откажи",
}) => {
  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
        <Modal.Container placement="center">
          <Modal.Dialog>
            <Modal.Header className="flex flex-col gap-1 text-2xl mt-3">
              {title}
            </Modal.Header>

            <Modal.Body>
              <div>{message}</div>

              <div className="flex flex-row mt-3 mb-4 space-x-3 justify-evenly">
                <button
                  onClick={() => {
                    onOpenChange(false);
                    onConfirm();
                  }}
                  className="w-full py-2.5 text-sm font-semibold text-center text-white transition-all bg-red-600 border border-red-600 rounded-lg hover:bg-red-500 active:scale-95"
                >
                  {confirmText}
                </button>

                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="w-full py-2.5 text-sm font-semibold text-center text-gray-700 transition-all bg-white border border-gray-200 rounded-lg hover:bg-gray-100 active:scale-95 cursor-pointer">
                  {cancelText}
                </button>
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default ConfirmModal;
