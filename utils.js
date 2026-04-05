export function validateFields(object, fieldRules) {
  const errors = {};

  for (const field in fieldRules) {
    const rules = fieldRules[field];
    const value = object[field];

    if (
      rules.required &&
      Array.isArray(value) &&
      !value.every((element) => Boolean(element))
    ) {
      const emptyPositions = [];

      value.forEach((element, index) => {
        if (!Boolean(element)) {
          emptyPositions.push(index);
        }
      });

      errors[field] = {
        message: "Полето трябва да съдържа стойност.",
        positions: emptyPositions,
      };
    }

    if (field.toLowerCase() === "email" && value) {
      validateEmail(field, value, errors);
    }

    if (
      (field.toLowerCase() === "password" ||
        field.toLowerCase() === "passwordRep") &&
      value
    ) {
      validatePassword(field, value, errors);
    }

    if (rules.minLength && value.length < rules.minLength) {
      errors[field] = `Полето трябва съдържа поне ${rules.minLength} символа.`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors[
        field
      ] = `Полето трябва да бъде по-кратко или равно на ${rules.maxLength} символа.`;
    }

    if (rules.minValue && Number(value) < rules.minValue) {
      errors[field] = `Минималната стойност на полето е ${rules.minValue}.`;
    }

    if (rules.maxValue && Number(value) > rules.maxValue) {
      errors[field] = `Максималната стойност на полето е ${rules.maxValue}.`;
    }

    if (rules.type && typeof value !== rules.type) {
      errors[field] = `Полето трябва да бъде от тип ${rules.type}.`;
    }

    if (
      rules.required &&
      !Array.isArray(value) &&
      (value === "" ||
        value === null ||
        (isNaN(value) && typeof value === "number"))
    ) {
      errors[field] = "Полето е задължително.";
    }
  }

  return Object.keys(errors).length === 0 ? null : errors;
}

function validateEmail(field, value, errors) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailPattern.test(value)) {
    errors[field] = "Въведете валиден имейл адрес.";
  }
}

function validatePassword(field, value, errors) {
  const passwordRegex = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$"
  );

  if (!passwordRegex.test(value)) {
    if (!value.match(/[a-zа-я]/)) {
      errors[field] = "Липсва малка буква.";
    } else if (!value.match(/[A-ZА-Я]/)) {
      errors[field] = "Липсва голяма буква.";
    } else if (!value.match(/[0-9]/)) {
      errors[field] = "Липсва цифра.";
    } else if (!value.match(/[^a-zA-Z0-9]/)) {
      errors[field] = "Липсва специален знак.";
    }
  }
}

export function objectIsEmpty(obj) {
  for (const key in obj) {
    if (
      obj.hasOwnProperty(key) &&
      obj[key] !== null &&
      obj[key] !== undefined &&
      obj[key] !== ""
    ) {
      return false;
    }
  }

  return true;
}

export function formatDate(date, format = "DD.MM.YYYY") {
  const d = new Date(date);
  if (isNaN(d)) return "—";
  const pad = (n) => String(n).padStart(2, "0");
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  switch (format) {
    case "DD.MM.YYYY HH:mm": return `${day}.${month}.${year} ${hours}:${minutes}`;
    case "DD.MM.YYYY H:mm": return `${day}.${month}.${year} ${d.getHours()}:${minutes}`;
    case "YYYY-MM-DD": return `${year}-${month}-${day}`;
    default: return `${day}.${month}.${year}`;
  }
}

const TIME_UNITS = [
  { max: 60, divisor: 1, unit: "секунда", units: "секунди" },
  { max: 3600, divisor: 60, unit: "минута", units: "минути" },
  { max: 86400, divisor: 3600, unit: "час", units: "часа" },
  { max: 2592000, divisor: 86400, unit: "ден", units: "дни" },
  { max: 31536000, divisor: 2592000, unit: "месец", units: "месеца" },
  { max: Infinity, divisor: 31536000, unit: "година", units: "години" },
];

export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 10) return "преди малко";

  for (const { max, divisor, unit, units } of TIME_UNITS) {
    if (seconds < max) {
      const val = Math.floor(seconds / divisor);
      return `преди ${val} ${val === 1 ? unit : units}`;
    }
  }
}

export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export function debounce(fn, ms) {
  let timer;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function productTitle(product) {
  switch (product?.category?.name) {
    case "Бутилки":
      return `${product.name} ${product.weight}гр.`;
    case "Балони":
      return `${product.name} пакет ${product.count}бр.`;
    case "Накрайник":
      return `${product.name} ${product.flavor}`;
    case "Вейпове":
      return `${product.name} ${product.puffs}k`;
    default:
      return product?.name;
  }
}

export function getPeriodParam(period) {
  if (period?.dateFrom || period?.dateTo) {
    return `dateFrom=${period.dateFrom}&dateTo=${period.dateTo}`;
  }

  switch (period?.period) {
    case "Днес":
      return "period=today";
    case "Вчера":
      return "period=yesterday";
    case "Последните 7 дни":
      return "period=last7days";
    case "Последният месец":
      return "period=lastMonth";
    case "Последните 3 месеца":
      return "period=last3Months";
    case "Последните 6 месеца":
      return "period=last6Months";
    case "Последната година":
      return "period=lastYear";
    case "Всички резултати":
      return "period=all";
    default:
      return "period=all";
  }
}

export async function fetchData(
  resource,
  page,
  perPage,
  searchText,
  filterData,
  orderColumn,
  userRole = ""
) {
  try {
    const params = {
      ...(page && { page }),
      ...(perPage && { per_page: perPage }),
      ...(searchText && { search: searchText }),
      ...(filterData?.dateFrom && { date_from: filterData.dateFrom }),
      ...(filterData?.dateTo && { date_to: filterData.dateTo }),
      ...(filterData?.product && { product: filterData.product }),
      ...(filterData?.minQuantity && { min_quantity: filterData.minQuantity }),
      ...(filterData?.maxQuantity && { max_quantity: filterData.maxQuantity }),
      ...(orderColumn?.name && { sort_column: orderColumn.name }),
      ...(orderColumn?.order && { sort_order: orderColumn.order }),
      ...(userRole && { user_role: userRole }),
    };

    const urlParams = new URLSearchParams(params);
    const url = `/api/${resource}${
      urlParams.toString() ? `?${urlParams.toString()}` : ""
    }`;

    const response = await fetch(url);

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export function getDateCondition(dateFrom, dateTo, period) {
  if (period === "all") {
    return {};
  }

  let startDate;
  let endDate;

  if (dateFrom && dateTo) {
    startDate = new Date(dateFrom);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(dateTo);
    endDate.setHours(23, 59, 59, 999);

    return {
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    };
  } else if (dateFrom) {
    startDate = new Date(dateFrom);
    return {
      date: {
        $gte: startDate,
      },
    };
  } else if (dateTo) {
    endDate = new Date(dateTo);
    return {
      date: {
        $lte: endDate,
      },
    };
  } else {
    switch (period) {
      case "today":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case "yesterday":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "last7days":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "lastMonth":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "last3Months":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "last6Months":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case "lastYear":
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0);
    }

    return {
      date:
        period === "yesterday"
          ? {
              $gte: startDate,
              $lt: new Date(startDate.getTime() + 24 * 60 * 60 * 1000),
            }
          : { $gte: startDate },
    };
  }
}

export function formatCurrency(amount, fractionDigits) {
  const parts = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).formatToParts(amount);

  let formattedAmount = "";

  for (const part of parts) {
    if (part.type === "group") {
      formattedAmount += " ";
    } else if (part.type === "decimal") {
      formattedAmount += ".";
    } else {
      formattedAmount += part.value;
    }
  }

  return formattedAmount + " €";
}
