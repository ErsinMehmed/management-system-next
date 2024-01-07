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

const ModalComponent = (props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      {props.isButton ? (
        <button
          type='button'
          className='hidden sm:block text-white bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-4 2xl:px-6 py-1.5 2xl:py-2.5 text-center transition-all active:scale-90'
          onClick={onOpen}>
          {props.openBtnText}
        </button>
      ) : (
        <div onClick={onOpen}>{props.openButton}</div>
      )}

      <Modal
        placement='center'
        isOpen={isOpen}
        scrollBehavior='inside'
        classNames={{
          header: "border-b border-gray-300",
        }}
        onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                {props.title}
              </ModalHeader>

              <ModalBody>{props.children}</ModalBody>

              <ModalFooter>
                <Button
                  color='danger'
                  variant='light'
                  onPress={onClose}>
                  {props.secondaryBtnText ?? "Откажи"}
                </Button>

                <Button
                  color='primary'
                  onPress={async () => {
                    const success = await props.saveBtnAction();

                    if (success) {
                      onClose();
                    }
                  }}>
                  {props.primaryBtnText ?? "Запази"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalComponent;
