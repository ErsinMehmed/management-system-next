import React from "react";
import { useDisclosure } from "@heroui/react";
import Modal from "@/components/Modal";
import UserAviabilityForm from "@/components/forms/UserAviability";

const UserAviability = (props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <button
        onClick={onOpen}
        className="text-white bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-6 py-2.5 text-center transition-all active:scale-90">
        Наличности
      </button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Наличности"
        size="xl"
        showFooter={false}>
        <UserAviabilityForm period={props.period} />
      </Modal>
    </>
  );
};

export default UserAviability;
