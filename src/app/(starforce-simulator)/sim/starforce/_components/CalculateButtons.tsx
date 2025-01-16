import { Tooltip } from "@nextui-org/react";
import { useMolecule } from "bunshi/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback, useEffect, useRef, useState } from "react";

import { StarforceSimulatorMolecule } from "~/app/(starforce-simulator)/sim/starforce/_lib/molecule";
import {
  type SimulateStarforceOutput,
  type SimulateStarforceInput,
} from "~/app/(starforce-simulator)/sim/starforce/_lib/workers/types";
import { E } from "~/shared/fp";
import { maxFractionDigits, maxFractionDigitsString } from "~/shared/math";
import { Button } from "~/shared/ui";

export const CalculateButtons = () => {
  const workerCount = useRef(1);
  const workers = useRef<Worker[]>([]);
  const [localResults, setLocalResults] = useState<
    { cost: number; destroyed: number }[]
  >([]);
  const [progress, setProgress] = useState(0);
  const [finishedWorkerCount, setFinishedWorkerCount] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const { inputsAtom, inputsErrorMessageAtom, resultsAtom } = useMolecule(
    StarforceSimulatorMolecule,
  );
  const inputsErrorMessage = useAtomValue(inputsErrorMessageAtom);
  const setResults = useSetAtom(resultsAtom);

  const handleWorkerOutput = useAtomCallback(
    useCallback(
      (_, set, output: SimulateStarforceOutput, progressUnit: number) => {
        if (output.type === "calculating") {
          setProgress((prev) => Math.min(100, prev + progressUnit));
        } else {
          setFinishedWorkerCount((prev) => prev + 1);
          setLocalResults((prev) => [...prev, ...output.result]);
        }
      },
      [],
    ),
  );

  const startCalculate = useAtomCallback(
    useCallback(
      (get) => {
        if (workers.current.length === 0) {
          return;
        }

        const inputs = E.getOrElseW(() => null)(get(inputsAtom));

        if (inputs) {
          const simulationTotalCount = inputs.simulationCount;
          const simulationSetCount = Math.min(100, simulationTotalCount);
          const simulationUnitCount = Math.floor(
            simulationTotalCount / simulationSetCount,
          );
          const progressUnit = maxFractionDigits(2)(100 / simulationSetCount);

          const simulationWorkerSetCount = Math.floor(
            simulationSetCount / workerCount.current,
          );

          workers.current = Array.from({
            length: workerCount.current,
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

  useEffect(() => {
    workerCount.current = Math.max(
      1,
      Math.floor(navigator.hardwareConcurrency * 0.5),
    );
    workers.current = Array.from({
      length: workerCount.current,
    }).map(
      () =>
        new Worker(
          new URL(
            "~/app/(starforce-simulator)/sim/starforce/_lib/workers/simulateStarforce.ts",
            import.meta.url,
          ),
        ),
    );
  }, []);

  useEffect(() => {
    if (
      workerCount.current > 0 &&
      finishedWorkerCount === workerCount.current
    ) {
      setIsCalculating(false);
      setResults(localResults);
    }
  }, [finishedWorkerCount, localResults, setResults]);

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
            setFinishedWorkerCount(0);
            setLocalResults([]);
            startCalculate();
          }}
          isDisabled={!!inputsErrorMessage || isCalculating}
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
