"use client";
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import Layout from "@/components/layout/Dashboard";
import Image from "next/image";
import BalloonsImg from "@/public/images/Balloons.png";
import Exotic640Img from "@/public/images/ExoticWhip-640G.png";
import Exotic2000Img from "@/public/images/ExoticWhip-2000G.webp";
import GreatWhip640Img from "@/public/images/GreatWhip-640G.webp";
import SilentBlueberryImg from "@/public/images/Silent-Nozzle-Blueberry.png";
import SilentPineappleImg from "@/public/images/Silent-Nozzle-Pineapple.png";
import SilentStrawberryImg from "@/public/images/Silent-Nozzle-Strawberry.png";
import SilentWatermelonImg from "@/public/images/Silent-Nozzle-Watermelon.png";
import { productStore } from "@/stores/useStore";

const DashboardStocks = () => {
  const { products, loadProducts } = productStore;

  useEffect(() => {
    loadProducts(false);
  }, [loadProducts]);

  const getProductImage = (name, weight, flavor) => {
    switch (name) {
      case "Exotic Whip":
        return weight === 640 ? Exotic640Img : Exotic2000Img;
      case "Great Whip":
        return GreatWhip640Img;
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
  };

  const productTitle = (product) => {
    switch (product.name) {
      case "Exotic Whip":
      case "Great Whip":
        return `${product.name} ${product.weight}гр.`;
      case "Балони":
        return `${product.name} ${product.count}бр.`;
      case "Накрайник с вкус":
        return `${product.name} ${product.flavor}`;
      default:
        return product.name;
    }
  };

  return (
    <Layout>
      <div className='grid grid-cols-4 gap-5 p-8 mt-14'>
        {products.map((product) => (
          <div
            key={product._id}
            className='py-2.5 rounded-lg bg-white shadow-md duration-300 hover:shadow-xl border border-transparent hover:border-gray-200'>
            <Image
              src={getProductImage(
                product.name,
                product?.weight,
                product.flavor
              )}
              className='h-56 w-full object-cover object-center border-b'
              alt={`Picture of ${product.name}`}
              width={"100%"}
              height={"100%"}
            />

            <div className='p-3.5'>
              <h2 className='mb-2 text-lg font-medium dark:text-white text-gray-900'>
                {productTitle(product)}
              </h2>

              <p className='mb-2 text-base dark:text-gray-300 text-gray-700'>
                Product description goes here.
              </p>

              <div className='flex items-center'>
                <p className='mr-2 text-lg font-semibold text-gray-900 dark:text-white'>
                  {product.price.toFixed(2)}лв.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default observer(DashboardStocks);
