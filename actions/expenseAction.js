class Expense {
  getExpenses = async (period) => {
    try {
      switch (period) {
        case "Днес":
          period = "today";
          break;
        case "Вчера":
          period = "yesterday";
          break;
        case "Последните 7 дни":
          period = "last7days";
          break;
        case "Последният месец":
          period = "lastMonth";
          break;
        case "Последните 3 месеца":
          period = "last3Months";
          break;
        case "Последните 6 месеца":
          period = "last6Months";
          break;
        case "Последната година":
          period = "lastYear";
          break;
        default:
          period = "lastMonth";
          break;
      }

      const response = await fetch(`/api/expenses?period=${period}`);

      return await response.json();
    } catch (error) {
      throw error;
    }
  };
}

export default new Expense();
