"use client";

import { identity } from "fp-ts/lib/function";

import { Starforce } from "~/entities/starforce";
import { getDiscountRatio } from "~/entities/starforce/utils";

import {
  type SimulateStarforceOutput,
  type SimulateStarforceInput,
} from "./types";

addEventListener(
  "message",
  ({
    data: {
      currentStar,
      discounts,
      event,
      level,
      safeguardRecord,
      spareCost,
      starcatchRecord,
      targetStar,
      simulationTotalCount,
      simulationSetCount,
    },
  }: MessageEvent<SimulateStarforceInput>) => {
    const probTable = Starforce.getProbTable(
      starcatchRecord,
      safeguardRecord,
      event,
    );

    const defaultCosts = Starforce.getCosts(level);

    const discountRatio = getDiscountRatio(discounts);
    const discountedCosts = defaultCosts
      .map((cost, index) => (index < 17 ? cost * (1 - discountRatio) : cost))
      .map(
        event === "30% 할인" || event === "샤타포스"
          ? (cost) => cost * 0.7
          : identity,
      )
      .map(Math.round);

    const simulationUnitCount = Math.floor(
      simulationTotalCount / simulationSetCount,
    );

    const costs: number[] = [];
    const destroyedCounts: number[] = [];

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
        let stack = 0;
        let spentCost = 0;
        let destroyedCount = 0;

        while (true) {
          const probabilities = probTable[star];

          // 100 % 여부 계산
          const isDecided = stack === 2 || probTable[star][0] === 1;

          // Cost 계산
          const cost =
            discountedCosts[star] +
            (isDecided || !safeguardRecord[`${star}`] ? 0 : defaultCosts[star]);
          spentCost += cost;

          // 랜덤 돌리고 다음 결과
          if (isDecided) {
            star += 1;
            stack = 0;
          } else {
            let result = probabilities.length;
            let r = Math.random();
            // console.log(r);
            for (let i = 0; i < probabilities.length; i++) {
              if (r < probabilities[i]) {
                result = i;
                break;
              }
              r -= probabilities[i];
            }

            if (result === 0) {
              // 성공
              star += 1 + (event === "10성 이하 1+1" && star <= 10 ? 1 : 0);
              stack = 0;
            } else if (result === 1) {
              // 유지
            } else if (result === 2) {
              // 하락
              star -= 1;
              stack += 1;
            } else if (result === 3) {
              // 파괴
              star = 12;
              stack = 0;
              spentCost += spareCost;
              destroyedCount += 1;
            } else {
              throw new Error("randomPickByProbabilities failed");
            }
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
    } satisfies SimulateStarforceOutput);
  },
);
