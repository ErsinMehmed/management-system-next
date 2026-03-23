"use client";
import { Modal, Button } from "@heroui/react";

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
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
        <Modal.Container
          placement="center"
          scroll="inside"
          size={size}
        >
          <Modal.Dialog>
            {showHeader && (
              <Modal.Header>
                <Modal.Heading>{title}</Modal.Heading>
              </Modal.Header>
            )}

            <Modal.Body className="px-3.5">{children}</Modal.Body>

            {showFooter && (
              <Modal.Footer>
                <Button
                  variant="ghost"
                  onPress={() => onOpenChange(false)}
                >
                  {secondaryBtnText}
                </Button>

                <Button
                  isDisabled={isLoading}
                  onPress={async () => {
                    const success = await onSave();
                    if (success) {
                      onOpenChange(false);
                    }
                  }}
                >
                  {primaryBtnText}
                </Button>
              </Modal.Footer>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default ModalComponent;
