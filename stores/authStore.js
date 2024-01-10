import { makeObservable, observable, action } from "mobx";
import authAction from "@/actions/authAction";
import commonStore from "./commonStore";
import { RegisterEnums } from "@/enums/status";
import { validateFields } from "@/utils";
import { generateRegisterRules } from "@/rules/register";

class Auth {
  userData = {
    name: "",
    email: "",
    password: "",
    passwordRep: "",
  };

  loginData = {
    email: "",
    password: "",
  };

  constructor() {
    makeObservable(this, {
      userData: observable,
      loginData: observable,
      setUserData: action,
      setLoginData: action,
    });
  }

  setUserData = (userData) => {
    this.userData = userData;
  };

  setLoginData = (loginData) => {
    this.loginData = loginData;
  };

  createUserProfile = async () => {
    commonStore.setErrorFields({});
    commonStore.setErrorMessage("");
    commonStore.setSuccessMessage("");

    const registerRules = generateRegisterRules();

    const errorFields = validateFields(this.userData, registerRules);

    if (errorFields) {
      commonStore.setErrorFields(errorFields);

      return;
    }

    const response = await authAction.createUser(this.userData);

    switch (response.status_code) {
      case RegisterEnums.PASSWORD_NOT_MATCH:
        this.handlePasswordNotMatchError();
        break;
      case RegisterEnums.USER_EXIST:
        this.handleUserExistError();
        break;
      case RegisterEnums.USER_CREATED:
        this.handleUserCreatedSuccess();
        break;
      default:
        this.handleDefaultError(response.errorFields);
    }
  };

  handleValidationErrors = (errorFields) => {
    commonStore.setErrorFields(errorFields);
  };

  handlePasswordNotMatchError = () => {
    commonStore.setErrorMessage("Въведените пароли не съвпадат");
    commonStore.setErrorFields({
      password: true,
      passwordRep: true,
    });
  };

  handleUserExistError = () => {
    commonStore.setErrorMessage("Потребителят вече съществува");
    commonStore.setErrorFields({
      email: true,
    });
  };

  handleUserCreatedSuccess = () => {
    commonStore.setSuccessMessage("Потребителят е създаден");
    this.resetUserData();
  };

  handleDefaultError = (errorFields) => {
    commonStore.setErrorFields(errorFields);
  };

  resetUserData = () => {
    this.userData = {
      name: "",
      email: "",
      password: "",
      passwordRep: "",
    };
  };

  login = async (e) => {
    e.preventDefault();

    commonStore.setIsLoading(true);

    const res = await authAction.login(this.loginData);

    if (res.error) {
      commonStore.setErrorMessage("Потребителят не съществува");
      commonStore.setErrorFields({
        error: true,
      });
      commonStore.setIsLoading(false);

      return;
    }
  };
}

export default new Auth();
