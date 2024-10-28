import React from "react";
import Modal from "@/components/Modal";
import UserInformationForm from "@/components/forms/UserInformation";

const UserInformation = (props) => {
  return (
    <Modal
      title="Потребители"
      size="xl"
      showFooter={true}
      openButton={
        <button className="text-white bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-6 py-2.5 text-center transition-all active:scale-90">
          Потребители
        </button>
      }
    >
      <UserInformationForm period={props.period} />
    </Modal>
  );
};

export default UserInformation;
