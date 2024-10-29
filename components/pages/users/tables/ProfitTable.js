import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { formatCurrency } from "@/utils";

const ProfitTable = ({
  saleIncomes,
  productExpenses,
  fuelExpenses,
  additionalExpenses,
  totalProfit,
  userPercent,
}) => (
  <Table isStriped>
    <TableHeader>
      <TableColumn>ТИП</TableColumn>
      <TableColumn>СУМА</TableColumn>
    </TableHeader>

    <TableBody>
      <TableRow>
        <TableCell>Приходи</TableCell>
        <TableCell>{formatCurrency(saleIncomes)}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell>Разходи за продукти</TableCell>
        <TableCell>{formatCurrency(productExpenses, 2)}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell>Разходи за гориво</TableCell>
        <TableCell>{formatCurrency(fuelExpenses, 2)}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell>Допълнителни разходи</TableCell>
        <TableCell>{formatCurrency(additionalExpenses)}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell>Обща печалба</TableCell>
        <TableCell>{formatCurrency(totalProfit, 2)}</TableCell>
      </TableRow>

      <TableRow>
        <TableCell className="font-semibold">КРАЙНА СУМА</TableCell>
        <TableCell className="font-semibold">
          {formatCurrency((totalProfit * userPercent) / 100, 2)}
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

export default ProfitTable;
