class Category {
  getCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      return response.json();
    } catch (error) {
      throw error;
    }
  };
}

const categoryAction = new Category();

export default categoryAction;
