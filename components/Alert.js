import React, {useEffect} from "react";
import {commonStore} from "@/stores/useStore";
import {addToast} from "@heroui/react";

const Alert = () => {
    const {setErrorMessage, setSuccessMessage, errorMessage, successMessage} =
        commonStore;

    useEffect(() => {
        if (errorMessage) {
            addToast({
                description: errorMessage,
                color: "danger",
                hideIcon: false,
            });

            setErrorMessage("");
        }

        if (successMessage) {
            addToast({
                description: successMessage,
                color: "success",
                hideIcon: false,
            });

            setSuccessMessage("");
        }
    }, [errorMessage, successMessage, setErrorMessage, setSuccessMessage]);

    return null;
};

export default Alert;