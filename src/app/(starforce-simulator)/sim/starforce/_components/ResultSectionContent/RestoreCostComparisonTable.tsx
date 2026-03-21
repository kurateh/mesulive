import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";

import { type RestoreCostComparisonRow } from "~/app/(starforce-simulator)/sim/starforce/_lib/molecule";
import { putUnit } from "~/shared/number";

interface Props {
  rows: RestoreCostComparisonRow[];
}

const formatCost = (cost: number | null) =>
  cost === null ? "-" : putUnit(cost);

export const RestoreCostComparisonTable = ({ rows }: Props) => {
  return (
    <Table
      removeWrapper
      aria-label="흔적 복구 평균 비용 비교 표"
      className="mt-2"
      selectedKeys={rows
        .filter((row) => row.isOptimized)
        .map((row) => `${row.star}`)}
      selectionMode="multiple"
      showSelectionCheckboxes={false}
      color="default"
    >
      <TableHeader>
        <TableColumn>파괴</TableColumn>
        <TableColumn>평균 복구 비용</TableColumn>
        <TableColumn>흔적 복구 비용 (스페어 + 메소)</TableColumn>
        <TableColumn>흔적 복구 적용</TableColumn>
      </TableHeader>
      <TableBody emptyContent="비교할 데이터가 없습니다.">
        {rows.map((row) => (
          <TableRow key={`${row.star}`}>
            <TableCell>{`${row.star}성`}</TableCell>
            <TableCell>{formatCost(row.noRestoreAvgCost)}</TableCell>
            <TableCell>{formatCost(row.withRestoreAvgCost)}</TableCell>
            <TableCell>{row.isOptimized ? "적용" : "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
