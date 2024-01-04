import { makeObservable, observable, action } from "mobx";

class Common {
  errorFields = {};
  errorMessage = "";
  successMessage = "";
  isLoading = false;

  constructor() {
    makeObservable(this, {
      errorFields: observable,
      errorMessage: observable,
      successMessage: observable,
      isLoading: observable,
      setErrorFields: action,
      setErrorMessage: action,
      setSuccessMessage: action,
      setIsLoading: action,
    });
  }

  setErrorFields = (errorFields) => {
    this.errorFields = errorFields;
  };

  setErrorMessage = (errorMessage) => {
    this.errorMessage = errorMessage;
  };

  setSuccessMessage = (successMessage) => {
    this.successMessage = successMessage;
  };

  setIsLoading = (isLoading) => {
    this.isLoading = isLoading;
  };
}

export default new Common();
