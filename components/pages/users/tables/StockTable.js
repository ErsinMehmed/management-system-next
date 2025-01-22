import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

const StockTable = ({ stocks, totalStock }) => (
  <Table isStriped>
    <TableHeader>
      <TableColumn>ПРОДУКТ</TableColumn>
      <TableColumn>КОЛИЧЕСТВО</TableColumn>
    </TableHeader>

    <TableBody>
      {stocks.map((product, index) => (
        <TableRow key={index}>
          <TableCell>{product.product_name}</TableCell>
          <TableCell>{product.stock} бр.</TableCell>
        </TableRow>
      ))}

      {stocks.length > 1 && (
        <TableRow>
          <TableCell className="font-semibold">ОБЩО:</TableCell>
          <TableCell className="font-semibold">{totalStock} бр.</TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);

export default StockTable;
