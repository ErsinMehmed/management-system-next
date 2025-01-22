import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import { formatCurrency } from "@/utils";
import { salesTableHeaders } from "@/data";

const SalesTable = ({ products, totalQuantity, totalPrice, totalExpenses }) => (
  <Table isStriped>
    <TableHeader>
      {salesTableHeaders.map((text, index) => (
        <TableColumn key={index}>{text}</TableColumn>
      ))}
    </TableHeader>

    <TableBody>
      {products.map((product, index) => (
        <TableRow key={index}>
          <TableCell>
            {product.name +
              " " +
              (product.name === "Балони"
                ? product.count + "бр."
                : product.weight + "гр.")}
          </TableCell>

          <TableCell>{product.total_quantity} бр.</TableCell>

          <TableCell>{formatCurrency(product.total_price)}</TableCell>

          <TableCell>{formatCurrency(product.total_cost)}</TableCell>
        </TableRow>
      ))}

      {products.length > 1 && (
        <TableRow>
          <TableCell className="font-semibold">ОБЩО:</TableCell>

          <TableCell className="font-semibold">{totalQuantity} бр.</TableCell>

          <TableCell className="font-semibold">
            {formatCurrency(totalPrice)}
          </TableCell>

          <TableCell className="font-semibold">
            {formatCurrency(totalExpenses)}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);

export default SalesTable;
