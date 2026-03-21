"use client";

import { identity } from "fp-ts/lib/function";

import { Starforce } from "~/entities/starforce";
import {
  getDiscountRatio,
  getRestoreTotalCost,
} from "~/entities/starforce/utils";

import {
  type SimulateStarforceOutput,
  type SimulateStarforceInput,
  type RestoreRecoveryCostStatsByStar,
} from "./types";

addEventListener(
  "message",
  ({
    data: {
      currentStar,
      discounts,
      event,
      level,
      restoreRecord,
      safeguardRecord,
      spareCost,
      targetStar,
      simulationTotalCount,
      simulationSetCount,
      collectRestoreRecoveryCostStats,
    },
  }: MessageEvent<SimulateStarforceInput>) => {
    const probTable = Starforce.getProbTable(safeguardRecord, event);

    const defaultCosts = Starforce.getCosts(level);

    const discountRatio = getDiscountRatio(discounts);
    const discountedCosts = defaultCosts
      .map((cost, index) => (index < 17 ? cost * (1 - discountRatio) : cost))
      .map(
        event !== null && Starforce.eventsWithGlobalCostDiscount.includes(event)
          ? (cost) => cost * 0.7
          : identity,
      )
      .map(Math.round);
    const isOnePlusOneEvent =
      event !== null && Starforce.eventsWithOnePlusOne.includes(event);

    const simulationUnitCount = Math.floor(
      simulationTotalCount / simulationSetCount,
    );

    const costs: number[] = [];
    const destroyedCounts: number[] = [];
    const restoreRecoveryCostStatsByStar = collectRestoreRecoveryCostStats
      ? Starforce.restoreAvailableStar.reduce<RestoreRecoveryCostStatsByStar>(
          (acc, star) => ({
            ...acc,
            [`${star}`]: {
              totalCost: 0,
              sampleCount: 0,
            },
          }),
          {},
        )
      : null;

    for (let s = 1; s <= simulationSetCount; s++) {
      for (
        let i = 1;
        i <=
        (s === simulationSetCount
          ? simulationTotalCount -
            (simulationSetCount - 1) * simulationUnitCount
          : simulationUnitCount);
        i++
      ) {
        let star = currentStar;
        let spentCost = 0;
        let destroyedCount = 0;
        let recoveryTrackers: Array<{
          targetStar: Starforce.RestoreAvailableStar;
          cost: number;
        }> = [];

        while (true) {
          const probabilities = probTable[star];

          // 100 % 여부 계산
          const isDecided = probTable[star][0] === 1;

          // Cost 계산
          const cost =
            discountedCosts[star] +
            (isDecided || !safeguardRecord[`${star}`]
              ? 0
              : defaultCosts[star] * 2);
          spentCost += cost;
          if (collectRestoreRecoveryCostStats && recoveryTrackers.length > 0) {
            recoveryTrackers = recoveryTrackers.map((tracker) => ({
              ...tracker,
              cost: tracker.cost + cost,
            }));
          }

          // 랜덤 돌리고 다음 결과
          if (isDecided) {
            star += 1;
          } else {
            let result = probabilities.length - 1;
            let r = Math.random();
            // console.log(r);
            for (let i = 0; i < probabilities.length; i++) {
              if (r < probabilities[i]) {
                result = i;
                break;
              }
              r -= probabilities[i];
            }

            if (result === Starforce.PROB_TABLE_SUCCESS_INDEX) {
              // 성공
              star += 1 + (isOnePlusOneEvent && star <= 10 ? 1 : 0);
            } else if (result === Starforce.PROB_TABLE_MAINTAIN_INDEX) {
              // 유지
            } else if (result === Starforce.PROB_TABLE_DESTROY_INDEX) {
              // 파괴
              const destroyedAtStar = star;
              let destroyExtraCost = 0;
              const isRestoreEnabled =
                restoreRecord[`${destroyedAtStar}`] &&
                Starforce.isRestoreAvailableLevel(level) &&
                Starforce.isStarforceRestoreAvailableStar(destroyedAtStar);

              if (isRestoreEnabled) {
                const restoreTotalCost = getRestoreTotalCost({
                  level,
                  star: destroyedAtStar,
                  spareCost,
                  event,
                });

                if (restoreTotalCost !== null) {
                  destroyExtraCost = restoreTotalCost;
                  spentCost += restoreTotalCost;
                  star = destroyedAtStar;
                } else {
                  star = 12;
                  destroyExtraCost = spareCost;
                  spentCost += destroyExtraCost;
                }
              } else {
                star = 12;
                destroyExtraCost = spareCost;
                spentCost += destroyExtraCost;
              }

              if (collectRestoreRecoveryCostStats) {
                if (recoveryTrackers.length > 0) {
                  recoveryTrackers = recoveryTrackers.map((tracker) => ({
                    ...tracker,
                    cost: tracker.cost + destroyExtraCost,
                  }));
                }

                if (
                  Starforce.isRestoreAvailableLevel(level) &&
                  Starforce.isStarforceRestoreAvailableStar(destroyedAtStar) &&
                  !isRestoreEnabled
                ) {
                  recoveryTrackers.push({
                    targetStar: destroyedAtStar,
                    cost: destroyExtraCost,
                  });
                }
              }

              destroyedCount += 1;
            } else {
              throw new Error("randomPickByProbabilities failed");
            }
          }

          if (
            collectRestoreRecoveryCostStats &&
            recoveryTrackers.length > 0 &&
            restoreRecoveryCostStatsByStar !== null
          ) {
            const remainedTrackers: typeof recoveryTrackers = [];

            recoveryTrackers.forEach((tracker) => {
              if (star >= tracker.targetStar) {
                const key = `${tracker.targetStar}` as const;
                const prev = restoreRecoveryCostStatsByStar[key];
                if (prev !== undefined) {
                  restoreRecoveryCostStatsByStar[key] = {
                    totalCost: prev.totalCost + tracker.cost,
                    sampleCount: prev.sampleCount + 1,
                  };
                }
              } else {
                remainedTrackers.push(tracker);
              }
            });

            recoveryTrackers = remainedTrackers;
          }

          // 성공했으면 result에 넣기
          if (star >= targetStar) {
            costs.push(spentCost);
            destroyedCounts.push(destroyedCount);
            break;
          }
        }
      }

      postMessage({
        type: "calculating",
      } satisfies SimulateStarforceOutput);
    }

    postMessage({
      type: "done",
      costs,
      destroyedCounts,
      restoreRecoveryCostStatsByStar,
    } satisfies SimulateStarforceOutput);
  },
);
