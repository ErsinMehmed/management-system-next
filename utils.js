import BalloonsImg from "@/public/images/Balloons.png";
import Exotic640Img from "@/public/images/ExoticWhip-640G.png";
import Exotic2000Img from "@/public/images/ExoticWhip-2000G.webp";
import Miami3300Img from "@/public/images/MiamiMagic-3300G.webp";
import BakingBad640Img from "@/public/images/BakingBad-640G.webp";
import BakingBad2200Img from "@/public/images/BakingBad-2200G.jpg";
import GreatWhip640Img from "@/public/images/GreatWhip-640G.webp";
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
    case "Miami Magic":
    case "Baking Bad":
      return `${product.name} ${product.weight}гр.`;
    case "Балони":
      return `${product.name} пакет ${product.count}бр.`;
    case "Накрайник с вкус":
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
      return GreatWhip640Img;
    case "Miami Magic":
      return Miami3300Img;
    case "Baking Bad":
      return weight === 640 ? BakingBad640Img : BakingBad2200Img;
    case "Балони":
      return BalloonsImg;
    case "Накрайник с вкус":
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
