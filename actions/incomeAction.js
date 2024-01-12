class Income {
  getIncomes = async (period) => {
    try {
      let periodParam;

      if (period?.dateFrom || period?.dateTo) {
        periodParam = `dateFrom=${period.dateFrom}&dateTo=${period.dateTo}`;
      } else {
        switch (period?.period) {
          case "Днес":
            periodParam = "period=today";
            break;
          case "Вчера":
            periodParam = "period=yesterday";
            break;
          case "Последните 7 дни":
            periodParam = "period=last7days";
            break;
          case "Последният месец":
            periodParam = "period=lastMonth";
            break;
          case "Последните 3 месеца":
            periodParam = "period=last3Months";
            break;
          case "Последните 6 месеца":
            periodParam = "period=last6Months";
            break;
          case "Последната година":
            periodParam = "period=lastYear";
            break;
          default:
            periodParam = "period=lastMonth";
            break;
        }
      }

      const response = await fetch(`/api/incomes?${periodParam}`);

      return await response.json();
    } catch (error) {
      throw error;
    }
  };
}

export default new Income();
