import React, { useEffect, useCallback } from "react";
import Modal from "@/components/Modal";
import UserAviabilityForm from "@/components/forms/UserAviability";
import { userStore } from "@/stores/useStore";

const UserAviability = () => {
  return (
    <Modal
      title="Наличности"
      showFooter={true}
      openButton={
        <button className="text-white bg-[#0071f5] hover:bg-blue-600 focus:outline-none font-semibold rounded-full text-sm px-6 py-2.5 text-center transition-all active:scale-90">
          Наличности
        </button>
      }
    >
      <UserAviabilityForm />
    </Modal>
  );
};

export default UserAviability;
