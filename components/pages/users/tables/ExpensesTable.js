import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";

const ExpensesTable = ({ fuelPrice }) => (
  <Table isStriped>
    <TableHeader>
      <TableColumn>ТИП</TableColumn>
      <TableColumn>СУМА</TableColumn>
    </TableHeader>

    <TableBody>
      <TableRow>
        <TableCell>Гориво</TableCell>
        <TableCell>{fuelPrice.toFixed(2)} лв.</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

export default ExpensesTable;
