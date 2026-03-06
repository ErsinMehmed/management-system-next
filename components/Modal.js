"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

const ModalComponent = ({
  isOpen,
  onOpenChange,
  title,
  size,
  showHeader = true,
  showFooter = true,
  primaryBtnText = "Запази",
  secondaryBtnText = "Откажи",
  isLoading = false,
  onSave,
  children,
}) => {
  return (
    <Modal
      placement="center"
      isOpen={isOpen}
      scrollBehavior="inside"
      size={size}
      classNames={{
        body: "px-3.5",
        base: "mx-5 sm:mx-0",
        header: showHeader
          ? "border-b border-gray-300 px-4"
          : "border-0",
      }}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            {showHeader && (
              <ModalHeader className="flex flex-col gap-1">
                {title}
              </ModalHeader>
            )}

            <ModalBody>{children}</ModalBody>

            {showFooter && (
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {secondaryBtnText}
                </Button>

                <Button
                  color="primary"
                  isLoading={isLoading}
                  onPress={async () => {
                    const success = await onSave();

                    if (success) {
                      onClose();
                    }
                  }}
                >
                  {primaryBtnText}
                </Button>
              </ModalFooter>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModalComponent;
