import { makeAutoObservable } from "mobx";
import authAction from "@/actions/authAction";
import roleApi from "@/actions/roleAction";
import commonStore from "./commonStore";
import { RegisterEnums } from "@/enums/status";
import { validateFields } from "@/utils";
import { generateRegisterRules } from "@/rules/register";

class Auth {
  userData = {
    name: "",
    email: "",
    role: "",
    password: "",
    passwordRep: "",
  };

  loginData = {
    email: "",
    password: "",
  };

  roles = [];

  constructor() {
    makeAutoObservable(this);
  }

  setUserData = (userData) => {
    this.userData = userData;
  };

  setLoginData = (loginData) => {
    this.loginData = loginData;
  };

  createUserProfile = async () => {
    commonStore.resetMessages();

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

  loadRoles = async () => {
    this.roles = await roleApi.getRoles();
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
      role: "",
      password: "",
      passwordRep: "",
    };
  };

  login = async () => {
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
