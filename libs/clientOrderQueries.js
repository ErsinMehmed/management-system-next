// Споделени MongoDB pipelines и JS helper-и за изчисленията върху ClientOrder.
// Инвариант: ClientOrder.price (и secondProduct.price) е ОБЩАТА сума за този
// продуктов ред, НЕ е цена за единица. Умножаване по quantity е грешка.

// ───────── JS helpers (за маршрути с fetch-then-compute, напр. analytics) ─────────

export const orderRevenue = (o) =>
  (o?.price || 0) + (o?.secondProduct?.price || 0);

export const orderCost = (o) =>
  (o?.product?.price || 0) * (o?.quantity || 0) +
  (o?.secondProduct?.product?.price || 0) * (o?.secondProduct?.quantity || 0);

export const orderCommission = (o) =>
  (o?.payout || 0) + (o?.secondProduct?.payout || 0);

export const orderProfit = (o) =>
  orderRevenue(o) -
  orderCost(o) -
  orderCommission(o) -
  (o?.deliveryCost || 0) -
  (o?.distributorPayout || 0);

// ───────── MongoDB изрази (върху сурови orders, без expansion) ─────────

export const revenueExpr = {
  $add: ["$price", { $ifNull: ["$secondProduct.price", 0] }],
};

export const commissionExpr = {
  $add: [
    { $ifNull: ["$payout", 0] },
    { $ifNull: ["$secondProduct.payout", 0] },
  ],
};

// Cost изразът разчита, че _productDoc и _secondProductDoc са били $lookup-нати
// и въведени в pipeline-а преди да се ползва.
export const costExpr = {
  $add: [
    {
      $multiply: [
        { $ifNull: ["$_productDoc.price", 0] },
        { $ifNull: ["$quantity", 0] },
      ],
    },
    {
      $multiply: [
        { $ifNull: ["$_secondProductDoc.price", 0] },
        { $ifNull: ["$secondProduct.quantity", 0] },
      ],
    },
  ],
};

// Profit изразът разчита на проектирани _revenue, _cost, _commissions полета.
export const profitExpr = {
  $subtract: [
    "$_revenue",
    {
      $add: [
        "$_cost",
        "$_commissions",
        { $ifNull: ["$deliveryCost", 0] },
        { $ifNull: ["$distributorPayout", 0] },
      ],
    },
  ],
};

// ───────── MongoDB pipelines ─────────

// Разгъва всяка поръчка в 1 (или 2 ако има secondProduct) реда. След това
// downstream group-by-product вижда по един ред на продуктова линия.
export const expandProducts = [
  {
    $addFields: {
      _entries: {
        $concatArrays: [
          [
            {
              product: "$product",
              quantity: "$quantity",
              price: "$price",
              deliveryCost: { $ifNull: ["$deliveryCost", 0] },
              payout: {
                $subtract: [
                  { $ifNull: ["$payout", 0] },
                  { $ifNull: ["$secondProduct.payout", 0] },
                ],
              },
              distributorPayout: { $ifNull: ["$distributorPayout", 0] },
              isPaid: "$isPaid",
              isMain: true,
            },
          ],
          {
            $cond: [
              {
                $and: [
                  { $ne: [{ $ifNull: ["$secondProduct.product", null] }, null] },
                  { $gt: [{ $ifNull: ["$secondProduct.quantity", 0] }, 0] },
                ],
              },
              [
                {
                  product: "$secondProduct.product",
                  quantity: "$secondProduct.quantity",
                  price: { $ifNull: ["$secondProduct.price", 0] },
                  deliveryCost: { $literal: 0 },
                  payout: { $ifNull: ["$secondProduct.payout", 0] },
                  distributorPayout: { $literal: 0 },
                  isPaid: "$isPaid",
                  isMain: false,
                },
              ],
              [],
            ],
          },
        ],
      },
    },
  },
  { $unwind: "$_entries" },
  {
    $addFields: {
      product: "$_entries.product",
      quantity: "$_entries.quantity",
      price: "$_entries.price",
      deliveryCost: "$_entries.deliveryCost",
      payout: "$_entries.payout",
      distributorPayout: "$_entries.distributorPayout",
      isPaid: "$_entries.isPaid",
      _isMain: "$_entries.isMain",
    },
  },
];

// Само product lookup, без category.
export const productLookup = [
  {
    $lookup: {
      from: "products",
      localField: "product",
      foreignField: "_id",
      as: "productDoc",
    },
  },
  { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
];

// Product + category lookup. Добавя orderPayout като удобна санитизация.
export const productAndCategoryLookup = [
  ...productLookup,
  {
    $lookup: {
      from: "categories",
      localField: "productDoc.category",
      foreignField: "_id",
      as: "categoryArr",
    },
  },
  {
    $addFields: {
      "productDoc.category": { $arrayElemAt: ["$categoryArr", 0] },
      orderPayout: { $ifNull: ["$payout", 0] },
    },
  },
  { $unset: "categoryArr" },
];
