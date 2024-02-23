import BalloonsImg from "@/public/images/Balloons.png";
import Exotic640Img from "@/public/images/ExoticWhip-640G.png";
import Exotic2000Img from "@/public/images/ExoticWhip-2000G.webp";
import FreshWhip615Img from "@/public/images/FreshWip-615G.png";
import Miami615Img from "@/public/images/MiamiMagic-615G.webp";
import Miami3300Img from "@/public/images/MiamiMagic-3300G.webp";
import BakingBad640Img from "@/public/images/BakingBad-640G.webp";
import BakingBad2200Img from "@/public/images/BakingBad-2200G.jpg";
import GreatWhip615Img from "@/public/images/GreatWhip-615G.webp";
import GreatWhip640Img from "@/public/images/GreatWhip-640G.webp";
import GreatWhip2200Img from "@/public/images/GreatWhip-2200G.jpg";
import SilentBlueberryImg from "@/public/images/Silent-Nozzle-Blueberry.png";
import SilentPineappleImg from "@/public/images/Silent-Nozzle-Pineapple.png";
import SilentStrawberryImg from "@/public/images/Silent-Nozzle-Strawberry.png";
import SilentWatermelonImg from "@/public/images/Silent-Nozzle-Watermelon.png";

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

    if (rules.minLength && value && value.length < rules.minLength) {
      errors[field] = `Полето трябва съдържа поне ${rules.minLength} символа.`;
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      errors[
        field
      ] = `Полето трябва да бъде по-кратко или равно на ${rules.maxLength} символа.`;
    }

    if (rules.minValue && value && Number(value) < rules.minValue) {
      errors[field] = `Минималната стойност на полето е ${rules.minValue}.`;
    }

    if (rules.maxValue && value && Number(value) > rules.maxValue) {
      errors[field] = `Максималната стойност на полето е ${rules.maxValue}.`;
    }

    if (rules.type && typeof value !== rules.type) {
      errors[field] = `Полето трябва да бъде от тип ${rules.type}.`;
    }

    if (
      rules.required &&
      !Array.isArray(value) &&
      (value === "" || value === null)
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

export function objectHasValues(obj) {
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

export function productTitle(product) {
  switch (product?.name) {
    case "Exotic Whip":
    case "Great Whip":
    case "Fresh Whip":
    case "Miami Magic":
    case "Baking Bad":
      return `${product.name} ${product.weight}гр.`;
    case "Балони":
      return `${product.name} пакет ${product.count}бр.`;
    case "Накрайник":
      return `${product.name} ${product.flavor}`;
    default:
      return product?.name;
  }
}

export function getProductImage(name, weight, flavor) {
  switch (name) {
    case "Exotic Whip":
      return weight === 640 ? Exotic640Img : Exotic2000Img;
    case "Great Whip":
      return weight === 615
        ? GreatWhip615Img
        : weight === 640
        ? GreatWhip640Img
        : GreatWhip2200Img;
    case "Miami Magic":
      return weight === 615 ? Miami615Img : Miami3300Img;
    case "Fresh Whip":
      return FreshWhip615Img;
    case "Baking Bad":
      return weight === 615 ? BakingBad640Img : BakingBad2200Img;
    case "Балони":
      return BalloonsImg;
    case "Накрайник":
      switch (flavor) {
        case "Ананас":
          return SilentPineappleImg;
        case "Боровинка":
          return SilentBlueberryImg;
        case "Диня":
          return SilentWatermelonImg;
        case "Ягода":
          return SilentStrawberryImg;
      }
  }
}

export function getProductImageByWeight(name) {
  switch (name) {
    case "Exotic Whip 640гр.":
      return Exotic640Img;
    case "Great Whip 615гр.":
      return GreatWhip615Img;
    case "Great Whip 640гр.":
      return GreatWhip640Img;
    case "Great Whip 2200гр.":
      return GreatWhip2200Img;
    case "Baking Bad 640гр.":
      return BakingBad640Img;
    case "Baking Bad 2200гр.":
      return BakingBad2200Img;
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
    default:
      return "period=lastMonth";
  }
}

export async function fetchData(
  resource,
  page,
  perPage,
  searchText,
  filterData,
  orderColumn
) {
  try {
    const params = {
      page: page || 1,
      per_page: perPage || 10,
      search: searchText,
      date_from: filterData?.dateFrom,
      date_to: filterData?.dateTo,
      product: filterData?.product,
      min_quantity: filterData?.minQuantity,
      max_quantity: filterData?.maxQuantity,
      sort_column: orderColumn?.name,
      sort_order: orderColumn?.order,
    };

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== "")
    );

    const urlParams = new URLSearchParams(filteredParams);
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
  const formatter = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return formatter.format(amount);
}
