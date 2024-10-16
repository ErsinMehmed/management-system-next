import React, { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { commonStore } from "@/stores/useStore";

const Alert = () => {
  const { setErrorMessage, setSuccessMessage, errorMessage, successMessage } =
    commonStore;

  const handleHideAlert = useCallback(() => {
    setErrorMessage("");
    setSuccessMessage("");
  }, [setErrorMessage, setSuccessMessage]);

  useEffect(() => {
    if (errorMessage || successMessage) {
      const timeoutId = setTimeout(() => {
        handleHideAlert();
      }, 3000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [errorMessage, successMessage, handleHideAlert]);

  return (
    (successMessage || errorMessage) && (
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className={`fixed top-12 sm:top-5 -ml-[165px] sm:-ml-[180px] left-1/2 center-element text-sm sm:text-base w-80 sm:w-[450px] py-3.5 sm:py-4 mb-4 z-[1000] ${
          errorMessage
            ? "text-red-600 bg-red-100"
            : "text-green-600 bg-green-100"
        }  rounded-lg font-medium`}
      >
        {errorMessage || successMessage}
      </motion.div>
    )
  );
};

export default Alert;
