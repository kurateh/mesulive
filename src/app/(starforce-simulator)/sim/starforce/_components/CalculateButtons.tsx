import { Tooltip } from "@heroui/react";
import { useMolecule } from "bunshi/react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "usehooks-ts";

import {
  StarforceSimulatorMolecule,
  type RestoreCostComparisonRow,
} from "~/app/(starforce-simulator)/sim/starforce/_lib/molecule";
import {
  type RestoreRecoveryCostStatsByStar,
  type SimulateStarforceOutput,
  type SimulateStarforceInput,
} from "~/app/(starforce-simulator)/sim/starforce/_lib/workers/types";
import { Starforce } from "~/entities/starforce";
import { getRestoreTotalCost } from "~/entities/starforce/utils";
import { E } from "~/shared/fp";
import { maxFractionDigits, maxFractionDigitsString } from "~/shared/math";
import { Button } from "~/shared/ui";

const createEmptyRestoreRecord = () =>
  Starforce.restoreAvailableStar.reduce<{ [key: `${number}`]: boolean }>(
    (acc, star) => ({
      ...acc,
      [`${star}`]: false,
    }),
    {},
  );

const createEmptyRestoreRecoveryCostStatsByStar =
  (): RestoreRecoveryCostStatsByStar =>
    Starforce.restoreAvailableStar.reduce<RestoreRecoveryCostStatsByStar>(
      (acc, star) => ({
        ...acc,
        [`${star}`]: {
          totalCost: 0,
          sampleCount: 0,
        },
      }),
      {},
    );

const mergeRestoreRecoveryCostStatsByStar = (
  base: RestoreRecoveryCostStatsByStar,
  next: RestoreRecoveryCostStatsByStar | null,
) => {
  if (next === null) {
    return base;
  }

  const merged = { ...base };
  Starforce.restoreAvailableStar.forEach((star) => {
    const key = `${star}` as const;
    const nextValue = next[key];
    if (nextValue === undefined) {
      return;
    }
    const prev = merged[key];
    merged[key] = {
      totalCost: (prev?.totalCost ?? 0) + nextValue.totalCost,
      sampleCount: (prev?.sampleCount ?? 0) + nextValue.sampleCount,
    };
  });

  return merged;
};

const getOptimizedRestoreRecord = ({
  level,
  targetStar,
  spareCost,
  event,
  restoreRecoveryCostStatsByStar,
}: {
  level: number;
  targetStar: number;
  spareCost: number;
  event: Starforce.Event | null;
  restoreRecoveryCostStatsByStar: RestoreRecoveryCostStatsByStar;
}) =>
  Starforce.restoreAvailableStar.reduce<{ [key: `${number}`]: boolean }>(
    (acc, star) => {
      const key = `${star}` as const;
      const restoreTotalCost = getRestoreTotalCost({
        level,
        star,
        spareCost,
        event,
      });
      const sampledValue = restoreRecoveryCostStatsByStar[key];
      const recoveryExpectedCost =
        sampledValue !== undefined && sampledValue.sampleCount > 0
          ? sampledValue.totalCost / sampledValue.sampleCount
          : null;

      return {
        ...acc,
        [key]:
          star < targetStar &&
          restoreTotalCost !== null &&
          recoveryExpectedCost !== null &&
          recoveryExpectedCost > restoreTotalCost,
      };
    },
    {},
  );

const getRestoreCostComparisonRows = ({
  level,
  targetStar,
  spareCost,
  event,
  restoreRecoveryCostStatsByStar,
  optimizedRestoreRecord,
}: {
  level: number;
  targetStar: number;
  spareCost: number;
  event: Starforce.Event | null;
  restoreRecoveryCostStatsByStar: RestoreRecoveryCostStatsByStar;
  optimizedRestoreRecord: { [key: `${number}`]: boolean };
}) =>
  Starforce.restoreAvailableStar
    .filter((star) => star < targetStar)
    .map<RestoreCostComparisonRow>((star) => {
      const key = `${star}` as const;
      const noRestoreStat = restoreRecoveryCostStatsByStar[key];
      const noRestoreAvgCost =
        noRestoreStat !== undefined && noRestoreStat.sampleCount > 0
          ? noRestoreStat.totalCost / noRestoreStat.sampleCount
          : null;

      return {
        star,
        noRestoreAvgCost,
        withRestoreAvgCost: getRestoreTotalCost({
          level,
          star,
          spareCost,
          event,
        }),
        isOptimized: optimizedRestoreRecord[key],
      };
    });

interface SimulationResult {
  costs: number[];
  destroyedCounts: number[];
  restoreRecoveryCostStatsByStar: RestoreRecoveryCostStatsByStar | null;
}

export const CalculateButtons = () => {
  const maxWorkerCount = useRef(1);
  const workers = useRef<Worker[]>([]);
  const calculationRunId = useRef(0);
  const activeReject = useRef<((reason?: unknown) => void) | null>(null);
  const [progress, setProgress] = useState(0);

  const {
    inputsAtom,
    inputsErrorMessageAtom,
    costsAtom,
    destroyedCountsAtom,
    optimizedCostsAtom,
    optimizedDestroyedCountsAtom,
    restoreCostComparisonRowsAtom,
    optimizedRestoreRecordAtom,
    isCalculatingAtom,
    isAutoOptimizeRestoreAtom,
  } = useMolecule(StarforceSimulatorMolecule);
  const [isCalculating, setIsCalculating] = useAtom(isCalculatingAtom);
  const inputsResult = useAtomValue(inputsAtom);
  const isAutoOptimizeRestore = useAtomValue(isAutoOptimizeRestoreAtom);
  const inputsErrorMessage = useAtomValue(inputsErrorMessageAtom);
  const setCosts = useSetAtom(costsAtom);
  const setDestroyedCounts = useSetAtom(destroyedCountsAtom);
  const setOptimizedCosts = useSetAtom(optimizedCostsAtom);
  const setOptimizedDestroyedCounts = useSetAtom(optimizedDestroyedCountsAtom);
  const setRestoreCostComparisonRows = useSetAtom(
    restoreCostComparisonRowsAtom,
  );
  const setOptimizedRestoreRecord = useSetAtom(optimizedRestoreRecordAtom);

  const cancelCalculate = useCallback(() => {
    calculationRunId.current += 1;
    workers.current.forEach((worker) => worker.terminate());
    workers.current = [];
    activeReject.current?.(new Error("calculation cancelled"));
    activeReject.current = null;
  }, []);

  const runSimulation = useCallback(
    ({
      inputs,
      collectRestoreRecoveryCostStats,
      progressWeight,
      progressTarget,
      runId,
    }: {
      inputs: Omit<
        SimulateStarforceInput,
        | "simulationSetCount"
        | "simulationTotalCount"
        | "collectRestoreRecoveryCostStats"
      > & {
        simulationCount: number;
      };
      collectRestoreRecoveryCostStats: boolean;
      progressWeight: number;
      progressTarget: number;
      runId: number;
    }) =>
      new Promise<SimulationResult>((resolve, reject) => {
        activeReject.current = reject;

        const simulationTotalCount = inputs.simulationCount;
        const simulationSetCount = Math.min(100, simulationTotalCount);
        const simulationUnitCount = Math.floor(
          simulationTotalCount / simulationSetCount,
        );
        const progressUnit = maxFractionDigits(2)(
          (100 * progressWeight) / simulationSetCount,
        );

        const simulationWorkerSetCount = Math.max(
          1,
          Math.floor(simulationSetCount / maxWorkerCount.current),
        );

        const localWorkers = Array.from({
          length: Math.min(maxWorkerCount.current, simulationTotalCount),
        }).map(
          () =>
            new Worker(
              new URL(
                "~/app/(starforce-simulator)/sim/starforce/_lib/workers/simulateStarforce.ts",
                import.meta.url,
              ),
            ),
        );

        workers.current = localWorkers;

        let localCosts: number[] = [];
        let localDestroyedCounts: number[] = [];
        let restoreRecoveryCostStatsByStar = collectRestoreRecoveryCostStats
          ? createEmptyRestoreRecoveryCostStatsByStar()
          : null;
        let finishedWorkerCount = 0;
        let settled = false;

        const settle = (callback: () => void) => {
          if (settled) return;
          settled = true;
          if (activeReject.current === reject) {
            activeReject.current = null;
          }
          callback();
        };

        localWorkers.forEach((worker, index, arr) => {
          const handleMessage = (
            event: MessageEvent<SimulateStarforceOutput>,
          ) => {
            if (calculationRunId.current !== runId) {
              return;
            }

            const output = event.data;

            if (output.type === "calculating") {
              setProgress((prev) => Math.min(100, prev + progressUnit));
              return;
            }

            finishedWorkerCount += 1;
            localCosts = [...localCosts, ...output.costs];
            localDestroyedCounts = [
              ...localDestroyedCounts,
              ...output.destroyedCounts,
            ];
            if (
              collectRestoreRecoveryCostStats &&
              restoreRecoveryCostStatsByStar
            ) {
              restoreRecoveryCostStatsByStar =
                mergeRestoreRecoveryCostStatsByStar(
                  restoreRecoveryCostStatsByStar,
                  output.restoreRecoveryCostStatsByStar,
                );
            }

            if (finishedWorkerCount !== localWorkers.length) {
              return;
            }

            localCosts.sort((a, b) => a - b);
            localDestroyedCounts.sort((a, b) => a - b);

            setProgress((prev) => Math.max(prev, progressTarget));
            settle(() =>
              resolve({
                costs: localCosts,
                destroyedCounts: localDestroyedCounts,
                restoreRecoveryCostStatsByStar,
              }),
            );
          };

          const handleError = (error: ErrorEvent) => {
            if (calculationRunId.current !== runId) {
              return;
            }
            settle(() => reject(error));
          };

          worker.addEventListener("message", handleMessage);
          worker.addEventListener("error", handleError);

          worker.postMessage({
            ...inputs,
            collectRestoreRecoveryCostStats,
            ...(index === arr.length - 1
              ? {
                  simulationTotalCount:
                    simulationTotalCount -
                    (arr.length - 1) *
                      simulationWorkerSetCount *
                      simulationUnitCount,
                  simulationSetCount:
                    simulationSetCount -
                    (arr.length - 1) * simulationWorkerSetCount,
                }
              : {
                  simulationTotalCount:
                    simulationWorkerSetCount * simulationUnitCount,
                  simulationSetCount: simulationWorkerSetCount,
                }),
          } satisfies SimulateStarforceInput);
        });
      }),
    [],
  );

  const handleCalculate = useCallback(async () => {
    setProgress(0);
    setIsCalculating(true);
    setOptimizedCosts([]);
    setOptimizedDestroyedCounts([]);
    setRestoreCostComparisonRows([]);
    setOptimizedRestoreRecord(createEmptyRestoreRecord());

    const runId = calculationRunId.current + 1;
    calculationRunId.current = runId;

    const inputs = E.getOrElseW(() => null)(inputsResult);
    if (inputs === null) {
      setIsCalculating(false);
      return;
    }

    const restoreAvailableStars = Starforce.restoreAvailableStar.filter(
      (star) => star < inputs.targetStar,
    );
    const shouldAutoOptimizeRestore =
      isAutoOptimizeRestore &&
      Starforce.isRestoreAvailableLevel(inputs.level) &&
      restoreAvailableStars.length > 0;

    try {
      const firstPassInputs = shouldAutoOptimizeRestore
        ? {
            ...inputs,
            restoreRecord: createEmptyRestoreRecord(),
          }
        : inputs;

      const firstPassResult = await runSimulation({
        inputs: firstPassInputs,
        collectRestoreRecoveryCostStats: shouldAutoOptimizeRestore,
        progressWeight: shouldAutoOptimizeRestore ? 0.5 : 1,
        progressTarget: shouldAutoOptimizeRestore ? 50 : 100,
        runId,
      });

      if (calculationRunId.current !== runId) {
        return;
      }

      setCosts(firstPassResult.costs);
      setDestroyedCounts(firstPassResult.destroyedCounts);

      if (!shouldAutoOptimizeRestore) {
        setProgress(100);
        return;
      }

      const optimizedRestoreRecord = getOptimizedRestoreRecord({
        level: inputs.level,
        targetStar: inputs.targetStar,
        spareCost: inputs.spareCost,
        event: inputs.event,
        restoreRecoveryCostStatsByStar:
          firstPassResult.restoreRecoveryCostStatsByStar ??
          createEmptyRestoreRecoveryCostStatsByStar(),
      });
      setOptimizedRestoreRecord(optimizedRestoreRecord);
      setRestoreCostComparisonRows(
        getRestoreCostComparisonRows({
          level: inputs.level,
          targetStar: inputs.targetStar,
          spareCost: inputs.spareCost,
          event: inputs.event,
          restoreRecoveryCostStatsByStar:
            firstPassResult.restoreRecoveryCostStatsByStar ??
            createEmptyRestoreRecoveryCostStatsByStar(),
          optimizedRestoreRecord,
        }),
      );
      const hasAnyOptimizedRestore = Object.values(optimizedRestoreRecord).some(
        Boolean,
      );

      if (!hasAnyOptimizedRestore) {
        setProgress(100);
        return;
      }

      const secondPassResult = await runSimulation({
        inputs: {
          ...inputs,
          restoreRecord: optimizedRestoreRecord,
        },
        collectRestoreRecoveryCostStats: false,
        progressWeight: 0.5,
        progressTarget: 100,
        runId,
      });

      if (calculationRunId.current !== runId) {
        return;
      }

      setOptimizedCosts(secondPassResult.costs);
      setOptimizedDestroyedCounts(secondPassResult.destroyedCounts);
      setProgress(100);
    } catch {
      // cancelled or worker error
    } finally {
      if (calculationRunId.current === runId) {
        workers.current = [];
        activeReject.current = null;
        setIsCalculating(false);
      }
    }
  }, [
    inputsResult,
    isAutoOptimizeRestore,
    runSimulation,
    setCosts,
    setDestroyedCounts,
    setIsCalculating,
    setOptimizedCosts,
    setOptimizedDestroyedCounts,
    setRestoreCostComparisonRows,
    setOptimizedRestoreRecord,
  ]);

  useIsomorphicLayoutEffect(() => {
    maxWorkerCount.current = Math.max(
      1,
      Math.floor(navigator.hardwareConcurrency * 0.5),
    );
  }, []);

  return (
    <div className="flex gap-4">
      <Tooltip
        content={inputsErrorMessage}
        isDisabled={inputsErrorMessage == null}
      >
        <Button
          className="flex-1"
          color={isCalculating ? "default" : "primary"}
          size="lg"
          onPress={handleCalculate}
          isDisabled={!!inputsErrorMessage || isCalculating}
          isLoading={isCalculating}
        >
          {isCalculating
            ? `계산 중...${maxFractionDigitsString(0)(progress)}%`
            : "계산하기"}
        </Button>
      </Tooltip>
      <Button
        className="flex-1"
        color={isCalculating ? "primary" : "default"}
        size="lg"
        onPress={() => {
          setIsCalculating(false);
          cancelCalculate();
        }}
        isDisabled={!isCalculating}
      >
        계산 취소
      </Button>
    </div>
  );
};
