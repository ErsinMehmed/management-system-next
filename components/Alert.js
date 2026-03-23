import React, {useEffect} from "react";
import {commonStore} from "@/stores/useStore";
import {toast} from "@heroui/react";

const Alert = () => {
    const {setErrorMessage, setSuccessMessage, errorMessage, successMessage} =
        commonStore;

    useEffect(() => {
        if (errorMessage) {
            toast.danger(errorMessage);
            setErrorMessage("");
        }

        if (successMessage) {
            toast.success(successMessage);
            setSuccessMessage("");
        }
    }, [errorMessage, successMessage, setErrorMessage, setSuccessMessage]);

    return null;
};

export default Alert;