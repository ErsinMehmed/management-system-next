import connectMongoDB from "@/libs/mongodb";
import Product from "@/models/product";

export default class RequestHandler {
  constructor(Model) {
    this.Model = Model;
  }

  async handleRequest(request) {
    const page = request.nextUrl.searchParams.get("page") || 1;
    const perPage = request.nextUrl.searchParams.get("per_page") || 10;
    const searchText = request.nextUrl.searchParams.get("search");
    const dateFrom = request.nextUrl.searchParams.get("date_from");
    const dateTo = request.nextUrl.searchParams.get("date_to");
    const product = request.nextUrl.searchParams.get("product");
    const minQuantity = request.nextUrl.searchParams.get("min_quantity");
    const maxQuantity = request.nextUrl.searchParams.get("max_quantity");
    const sortColumn = request.nextUrl.searchParams.get("sort_column");
    const sortOrder = request.nextUrl.searchParams.get("sort_order");

    await connectMongoDB();

    let queryBuilder = this.Model.find();

    if (searchText?.length > 0) {
      const productIds = await Product.find({
        name: { $regex: new RegExp(searchText, "i") },
      }).distinct("_id");

      queryBuilder = queryBuilder.where("product").in(productIds);
    }

    if (dateFrom) {
      queryBuilder = queryBuilder.where("date").gte(new Date(dateFrom));
    }

    if (dateTo) {
      queryBuilder = queryBuilder.where("date").lte(new Date(dateTo));
    }

    if (product) {
      queryBuilder.where("product").equals(product);
    }

    if (minQuantity) {
      queryBuilder.where("quantity").gte(parseInt(minQuantity));
    }

    if (maxQuantity) {
      queryBuilder.where("quantity").lte(parseInt(maxQuantity));
    }

    if (sortColumn && sortOrder) {
      const sortObject = {};
      sortObject[sortColumn] = sortOrder === "asc" ? 1 : -1;
      queryBuilder = queryBuilder.sort(sortObject);
    } else {
      queryBuilder = queryBuilder.sort({ _id: -1 });
    }

    const totalItems = await this.Model.countDocuments(queryBuilder);
    const items = await queryBuilder
      .populate({
        path: "product",
        select: "name weight flavor count category",
      })
      .skip((page - 1) * perPage)
      .limit(perPage);

    const pagination = {
      current_page: parseInt(page),
      total_pages: Math.ceil(totalItems / perPage),
      total_results: totalItems,
      per_page: parseInt(perPage),
    };

    return { items, pagination };
  }
}
