//  "type": "module",
import mongoose from "mongoose";
import dotenv from "dotenv";
import chalk from "chalk";
import Product from "../models/product.js";

dotenv.config({ path: new URL("../.env", import.meta.url) });

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("DB Connected"))
  .catch((error) => console.log("DB Connection Failed", error.message));

const data = [
  {
    name: "Exotic Whip",
    weight: 640,
    price: 27,
    sell_prices: [60, 115, 155, 200, 235, 270],
    category: "65932958c886e9d1f6c951e2",
    availability: 0,
  },
  {
    name: "Exotic Whip",
    weight: 2000,
    price: 80,
    sell_prices: [150, 285, 400],
    category: "65932958c886e9d1f6c951e2",
    availability: 0,
  },
  {
    name: "Miami Magic",
    weight: 3300,
    price: 80,
    sell_prices: [150, 285, 400],
    category: "65932958c886e9d1f6c951e2",
    availability: 0,
  },
  {
    name: "Great Whip",
    weight: 640,
    price: 23,
    sell_prices: [55, 110, 140, 190, 225, 255],
    category: "65932958c886e9d1f6c951e2",
    availability: 0,
  },
  {
    name: "Балони",
    count: 100,
    price: 6,
    sell_prices: [10],
    category: "6593296bc886e9d1f6c951e4",
    availability: 0,
  },
  {
    name: "Накрайник",
    flavor: "Ананас",
    price: 3,
    sell_prices: [5],
    category: "65932976c886e9d1f6c951e6",
    availability: 0,
  },
  {
    name: "Накрайник",
    flavor: "Боровинка",
    price: 3,
    sell_prices: [5],
    category: "65932976c886e9d1f6c951e6",
    availability: 0,
  },
  {
    name: "Накрайник",
    flavor: "Диня",
    price: 3,
    sell_prices: [5],
    category: "65932976c886e9d1f6c951e6",
    availability: 0,
  },
  {
    name: "Накрайник",
    flavor: "Ягода",
    price: 3,
    sell_prices: [5],
    category: "65932976c886e9d1f6c951e6",
    availability: 0,
  },
];

const importProductData = async () => {
  try {
    await Product.deleteMany();

    await Product.insertMany(data);

    console.log(
      `${chalk.bold(
        "ProductSeeder.js"
      )} .......................................................................................... ${chalk.bold.green(
        "DONE"
      )}`
    );
    process.exit(0);
  } catch (error) {
    console.log(
      `${chalk.bold(
        error.message
      )} .......................................................................................... ${chalk.bold.red(
        "FAILED"
      )}`
    );
    process.exit(1);
  }
};

importProductData();
