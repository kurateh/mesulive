"use client";

import { Skeleton, Spacer } from "@heroui/react";
import { useMolecule } from "bunshi/react";
import { useAtomValue } from "jotai";

import { StarforceSimulatorMolecule } from "~/app/(starforce-simulator)/sim/starforce/_lib/molecule";
import { cx } from "~/shared/style";
import { SectionSubtitle } from "~/shared/ui";

import { ResultChart } from "./ResultChart";
import { TopPercent } from "./TopPercent";

import "./ResultSectionContent.css";

export const ResultSectionContent = () => {
  const {
    resultExistsAtom,
    isCalculatingAtom,
    costsAtom,
    destroyedCountsAtom,
  } = useMolecule(StarforceSimulatorMolecule);
  const resultsExists = useAtomValue(resultExistsAtom);
  const isCalculating = useAtomValue(isCalculatingAtom);

  return (
    <div className="flex flex-col gap-2">
      <SectionSubtitle>소모 비용</SectionSubtitle>
      <div
        className={cx(
          "mt-2 h-[400px]",
          resultsExists || "flex items-center justify-center",
        )}
      >
        {isCalculating ? (
          <Skeleton className="m-2 h-full w-full rounded-2xl" />
        ) : resultsExists ? (
          <ResultChart dataAtom={costsAtom} type="cost" />
        ) : (
          <p className="text-default-400">
            시뮬레이션 결과가 여기에 표시됩니다.
          </p>
        )}
      </div>
      <Spacer y={2} />
      <TopPercent dataAtom={costsAtom} type="cost" />
      <SectionSubtitle>파괴 횟수</SectionSubtitle>
      <div
        className={cx(
          "mt-2 h-[400px]",
          resultsExists || "flex items-center justify-center",
        )}
      >
        {isCalculating ? (
          <Skeleton className="m-2 h-full w-full rounded-2xl" />
        ) : resultsExists ? (
          <ResultChart dataAtom={destroyedCountsAtom} type="destroyedCount" />
        ) : (
          <p className="text-default-400">
            시뮬레이션 결과가 여기에 표시됩니다.
          </p>
        )}
      </div>
      <Spacer y={2} />
      <TopPercent dataAtom={destroyedCountsAtom} type="destroyedCount" />
    </div>
  );
};
