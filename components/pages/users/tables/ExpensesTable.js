import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

const ExpensesTable = ({ fuelPrice }) => (
  <Table isStriped>
    <TableHeader>
      <TableColumn>ТИП</TableColumn>
      <TableColumn>СУМА</TableColumn>
    </TableHeader>

    <TableBody>
      <TableRow>
        <TableCell>Гориво</TableCell>
        <TableCell>{fuelPrice.toFixed(2)} €</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

export default ExpensesTable;
