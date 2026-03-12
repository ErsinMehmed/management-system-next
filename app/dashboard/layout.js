import connectMongoDB from "@/libs/mongodb";
import Product from "@/models/product";
import ProductsHydrator from "@/components/layout/ProductsHydrator";

export default async function DashboardLayout({ children }) {
  await connectMongoDB();

  const products = await Product.find({}).populate("category").lean();

  return (
    <ProductsHydrator products={JSON.parse(JSON.stringify(products))}>
      {children}
    </ProductsHydrator>
  );
}
