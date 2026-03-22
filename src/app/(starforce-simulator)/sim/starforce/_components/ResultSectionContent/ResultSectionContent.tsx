"use client";

import { Skeleton, Spacer } from "@heroui/react";
import { useMolecule } from "bunshi/react";
import { useAtomValue } from "jotai";

import { StarforceSimulatorMolecule } from "~/app/(starforce-simulator)/sim/starforce/_lib/molecule";
import { cx } from "~/shared/style";
import { SectionSubtitle } from "~/shared/ui";

import { RestoreCostComparisonTable } from "./RestoreCostComparisonTable";
import { ResultChart } from "./ResultChart";
import { TopPercent } from "./TopPercent";

import "./ResultSectionContent.css";

export const ResultSectionContent = () => {
  const {
    resultExistsAtom,
    isCalculatingAtom,
    costsAtom,
    consumedEquipCountsAtom,
    optimizedCostsAtom,
    optimizedConsumedEquipCountsAtom,
    restoreCostComparisonRowsAtom,
    isHighchartsLoadedAtom,
  } = useMolecule(StarforceSimulatorMolecule);
  const resultsExists = useAtomValue(resultExistsAtom);
  const isCalculating = useAtomValue(isCalculatingAtom);
  const isHighchartsLoaded = useAtomValue(isHighchartsLoadedAtom);
  const optimizedCosts = useAtomValue(optimizedCostsAtom);
  const optimizedConsumedEquipCounts = useAtomValue(
    optimizedConsumedEquipCountsAtom,
  );
  const restoreCostComparisonRows = useAtomValue(restoreCostComparisonRowsAtom);
  const optimizedCostResultExists = optimizedCosts.length > 0;
  const optimizedConsumedEquipResultExists =
    optimizedConsumedEquipCounts.length > 0;

  return (
    <div className="flex flex-col gap-2">
      {restoreCostComparisonRows.length > 0 && (
        <>
          <SectionSubtitle>흔적 복구 유무 비교</SectionSubtitle>
          <div className="overflow-y-auto">
            <RestoreCostComparisonTable rows={restoreCostComparisonRows} />
          </div>
          <Spacer y={2} />
        </>
      )}
      <SectionSubtitle>소모 비용</SectionSubtitle>
      <div
        className={cx(
          "mt-2 h-[400px]",
          resultsExists || "flex items-center justify-center",
        )}
      >
        {isCalculating || !isHighchartsLoaded ? (
          <Skeleton className="m-2 h-full w-full rounded-2xl" />
        ) : resultsExists ? (
          <ResultChart
            dataAtom={costsAtom}
            overlayDataAtom={optimizedCostsAtom}
            type="cost"
          />
        ) : (
          <p className="text-default-400">
            시뮬레이션 결과가 여기에 표시됩니다.
          </p>
        )}
      </div>
      <Spacer y={2} />
      <TopPercent dataAtom={costsAtom} type="cost" />
      {optimizedCostResultExists && (
        <>
          <p className="text-sm font-bold text-default-800">
            흔적 복구 최적화 시
          </p>
          <TopPercent dataAtom={optimizedCostsAtom} type="cost" />
        </>
      )}
      <SectionSubtitle>소모 장비</SectionSubtitle>
      <div
        className={cx(
          "mt-2 h-[400px]",
          resultsExists || "flex items-center justify-center",
        )}
      >
        {isCalculating || !isHighchartsLoaded ? (
          <Skeleton className="m-2 h-full w-full rounded-2xl" />
        ) : resultsExists ? (
          <ResultChart
            dataAtom={consumedEquipCountsAtom}
            overlayDataAtom={optimizedConsumedEquipCountsAtom}
            type="consumedEquipCount"
          />
        ) : (
          <p className="text-default-400">
            시뮬레이션 결과가 여기에 표시됩니다.
          </p>
        )}
      </div>
      <Spacer y={2} />
      <TopPercent
        dataAtom={consumedEquipCountsAtom}
        type="consumedEquipCount"
      />
      {optimizedConsumedEquipResultExists && (
        <>
          <p className="text-sm font-bold text-default-800">
            흔적 복구 최적화 시
          </p>
          <TopPercent
            dataAtom={optimizedConsumedEquipCountsAtom}
            type="consumedEquipCount"
          />
        </>
      )}
    </div>
  );
};
