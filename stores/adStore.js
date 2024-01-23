import { makeObservable, observable, action } from "mobx";
import { validateFields } from "@/utils";
import commonStore from "./commonStore";
import adAction from "@/actions/adAction";
import { adRules as getAdRules } from "@/rules/ad";

class Ad {
  ads = [];
  adData = {
    platform: "",
    amount: null,
    date: "",
  };

  constructor() {
    makeObservable(this, {
      ads: observable,
      adData: observable,
      setAds: action,
      setAdData: action,
    });
  }

  setAds = (data) => {
    this.ads = data;
  };

  setAdData = (data) => {
    this.adData = data;
  };

  clearAdData = () => {
    this.adData = {
      platform: "",
      amount: null,
      date: "",
    };
  };

  loadAds = async () => {
    this.setAds(await adAction.getAds());
  };

  createAd = async () => {
    commonStore.setErrorFields({});
    commonStore.setErrorMessage("");
    commonStore.setSuccessMessage("");

    const adRules = getAdRules();
    const errorFields = validateFields(this.adData, adRules);

    if (errorFields) {
      commonStore.setErrorFields(errorFields);
      return false;
    }

    const response = await adAction.createAd(this.adData);

    if (response.status) {
      commonStore.setSuccessMessage(response.message);
      this.clearAdData();
      this.loadAds();

      return true;
    } else if (!response.status) {
      commonStore.setErrorMessage(response.message);

      return false;
    }

    return false;
  };

  deleteAd = async (id) => {
    const response = await adAction.deleteAd(id);

    if (response.status) {
      commonStore.setSuccessMessage(response.message);
      this.loadAds();
    }
  };
}

export default new Ad();
