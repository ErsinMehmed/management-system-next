import { makeObservable, observable, action } from "mobx";
import adAction from "@/actions/adAction";

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
}

export default new Ad();
