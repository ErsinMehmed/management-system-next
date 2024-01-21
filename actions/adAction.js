class Ad {
  createAd = async (data) => {
    try {
      const response = await fetch("/api/marketing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return response.json();
    } catch (error) {
      throw error;
    }
  };

  getAd = async () => {
    try {
      const response = await fetch("/api/marketing");

      const data = await response.json();

      return data;
    } catch (error) {
      throw error;
    }
  };

  deleteAd = async (id) => {
    try {
      const response = await fetch(`/api/marketing?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };
}

export default new Ad();
