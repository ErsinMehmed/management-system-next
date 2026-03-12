import { makeAutoObservable } from "mobx";
import categoryAction from "@/actions/categoryAction";

class CategoryStore {
  categories = [];
  isLoading = true;

  constructor() {
    makeAutoObservable(this);
  }

  setCategories = (data) => {
    this.categories = data;
  };

  loadCategories = async () => {
    try {
      const data = await categoryAction.getCategories();
      this.setCategories(data.map((c) => c.name));
    } finally {
      this.isLoading = false;
    }
  };

  loadCategoriesIfNotLoaded = async () => {
    if (this.categories.length === 0) {
      await this.loadCategories();
    }
  };

  hydrate = (categories) => {
    this.categories = categories;
    this.isLoading = false;
  };
}

const categoryStore = new CategoryStore();

export default categoryStore;
