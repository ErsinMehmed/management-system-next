import React from "react";
import { useDisclosure } from "@heroui/react";
import Modal from "@/components/Modal";
import UserInformationForm from "@/components/forms/UserInformation";

const UserInformation = (props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <button
        onClick={onOpen}
        className="text-white bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-6 py-2.5 text-center transition-all active:scale-90">
        Потребители
      </button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Потребители"
        size="xl"
        showFooter={false}>
        <UserInformationForm period={props.period} />
      </Modal>
    </>
  );
};

export default UserInformation;
