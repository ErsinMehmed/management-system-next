class Role {
  getRoles = async () => {
    try {
      const response = await fetch("api/roles");

      return response.json();
    } catch (error) {
      throw error;
    }
  };
}

export default new Role();
