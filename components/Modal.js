"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { FiPlus } from "react-icons/fi";

const ModalComponent = (props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <div className="relative">
        {props.isButton ? (
          <button
            type="button"
            className="text-white bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-1.5 sm:px-4 2xl:px-6 py-1.5 2xl:py-2.5 text-center transition-all active:scale-90"
            onClick={onOpen}
          >
            <span className="hidden sm:block">{props.openBtnText}</span>
            <FiPlus className="w-5 h-5 sm:hidden" />
          </button>
        ) : (
          <div className="z-0" onClick={onOpen}>
            {props.openButton}
          </div>
        )}
      </div>

      <Modal
        placement="center"
        isOpen={isOpen}
        scrollBehavior="inside"
        size={props.size}
        classNames={{
          body: "px-3.5",
          base: "mx-5 sm:mx-0",
          header: !props.showHeader
            ? "border-b border-gray-300 px-4"
            : "border-0",
        }}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              {!props.showHeader && (
                <ModalHeader className="flex flex-col gap-1">
                  {props.title}
                </ModalHeader>
              )}

              <ModalBody>{props.children}</ModalBody>

              {!props.showFooter && (
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    {props.secondaryBtnText ?? "Откажи"}
                  </Button>

                  <Button
                    color="primary"
                    isLoading={props.isRecordCreated}
                    onPress={async () => {
                      const success = await props.saveBtnAction();

                      if (success) {
                        onClose();
                      }
                    }}
                  >
                    {props.primaryBtnText ?? "Запази"}
                  </Button>
                </ModalFooter>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalComponent;
