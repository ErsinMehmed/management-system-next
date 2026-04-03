import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Името трябва да е поне 2 символа").max(100, "Името е прекалено дълго").trim(),
});

export const roleSchema = z.object({
  name: z.string().min(2, "Името трябва да е поне 2 символа").max(100, "Името е прекалено дълго").trim(),
});

export const distributorSchema = z.object({
  name: z.string().min(1, "Името е задължително").max(200, "Името е прекалено дълго").trim(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Името трябва да е поне 2 символа").max(100, "Името е прекалено дълго").trim(),
  flavor: z.string().max(100).optional().default(""),
  weight: z.number().positive("Теглото трябва да е положително число").optional(),
  model: z.string().max(100).optional(),
  count: z.number().int().min(0).optional(),
  puffs: z.number().int().min(0).optional(),
  availability: z.number().int().min(0, "Наличността не може да е отрицателна").default(0),
  units_per_box: z.number().int().min(1, "Бройки в кашон трябва да е поне 1").optional(),
  price: z.number().min(0, "Цената не може да е отрицателна"),
  hidden: z.boolean().default(false),
  image_url: z.string().url("Невалиден URL на снимка").optional().or(z.literal("")),
  sell_prices: z.array(z.number().min(0, "Цената не може да е отрицателна")).min(1, "Трябва поне една цена за продажба"),
  seller_prices: z.array(z.number().min(0)).default([]),
  category: z.string().min(1, "Категорията е задължителна"),
});
