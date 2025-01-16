import { Tooltip } from "@heroui/react";
import { useMolecule } from "bunshi/react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback, useRef, useState, useTransition } from "react";
import { useIsomorphicLayoutEffect } from "usehooks-ts";

import { StarforceSimulatorMolecule } from "~/app/(starforce-simulator)/sim/starforce/_lib/molecule";
import {
  type SimulateStarforceOutput,
  type SimulateStarforceInput,
} from "~/app/(starforce-simulator)/sim/starforce/_lib/workers/types";
import { E } from "~/shared/fp";
import { maxFractionDigits, maxFractionDigitsString } from "~/shared/math";
import { Button } from "~/shared/ui";

export const CalculateButtons = () => {
  const maxWorkerCount = useRef(1);
  const workers = useRef<Worker[]>([]);
  const localCosts = useRef<number[]>([]);
  const localDestroyedCounts = useRef<number[]>([]);
  const finishedWorkerCount = useRef(0);
  const [progress, setProgress] = useState(0);

  const [, startTransition] = useTransition();

  const {
    inputsAtom,
    inputsErrorMessageAtom,
    costsAtom,
    destroyedCountsAtom,
    isCalculatingAtom,
  } = useMolecule(StarforceSimulatorMolecule);
  const [isCalculating, setIsCalculating] = useAtom(isCalculatingAtom);
  const inputsErrorMessage = useAtomValue(inputsErrorMessageAtom);
  const setCosts = useSetAtom(costsAtom);
  const setDestroyedCounts = useSetAtom(destroyedCountsAtom);

  const handleWorkerOutput = useAtomCallback(
    useCallback(
      (_, set, output: SimulateStarforceOutput, progressUnit: number) => {
        startTransition(() => {
          if (output.type === "calculating") {
            setProgress((prev) => Math.min(100, prev + progressUnit));
          } else {
            finishedWorkerCount.current += 1;
            localCosts.current = [...localCosts.current, ...output.costs];
            localDestroyedCounts.current = [
              ...localDestroyedCounts.current,
              ...output.destroyedCounts,
            ];
            // console.log(finishedWorkerCount);
          }

          if (finishedWorkerCount.current === workers.current.length) {
            localCosts.current.sort((a, b) => a - b);
            localDestroyedCounts.current.sort((a, b) => a - b);

            setCosts(localCosts.current);
            setDestroyedCounts(localDestroyedCounts.current);
            setIsCalculating(false);
          }
        });
      },
      [setCosts, setDestroyedCounts, setIsCalculating],
    ),
  );

  const startCalculate = useAtomCallback(
    useCallback(
      (get) => {
        const inputs = E.getOrElseW(() => null)(get(inputsAtom));

        if (inputs) {
          const simulationTotalCount = inputs.simulationCount;
          const simulationSetCount = Math.min(100, simulationTotalCount);
          const simulationUnitCount = Math.floor(
            simulationTotalCount / simulationSetCount,
          );
          const progressUnit = maxFractionDigits(2)(100 / simulationSetCount);

          const simulationWorkerSetCount = Math.max(
            1,
            Math.floor(simulationSetCount / maxWorkerCount.current),
          );

          workers.current = Array.from({
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

          workers.current.forEach((worker, index, arr) => {
            // eslint-disable-next-line no-param-reassign
            worker.onmessage = (
              event: MessageEvent<SimulateStarforceOutput>,
            ) => {
              handleWorkerOutput(event.data, progressUnit);
            };

            worker.postMessage({
              ...inputs,
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
        }
      },
      [handleWorkerOutput, inputsAtom],
    ),
  );

  const cancelCalculate = () => {
    if (workers.current) {
      workers.current.forEach((w) => w.terminate());
    }
  };

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
          onPress={() => {
            setProgress(0);
            setIsCalculating(true);
            finishedWorkerCount.current = 0;
            localCosts.current = [];
            localDestroyedCounts.current = [];
            startCalculate();
          }}
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
