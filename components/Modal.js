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
      <Button color="primary" onPress={onOpen}>
        {props.openBtnText}
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {props.title}
              </ModalHeader>

              <ModalBody>{props.children}</ModalBody>

              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {props.secondaryBtnText ?? "Откажи"}
                </Button>

                <Button color="primary" onPress={props.saveBtnAction}>
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
