import { match } from "ts-pattern";

import {
  discountRatio,
  starforceProbTable,
  type Discount,
  type Event,
} from "./constants";

export const getReachableStar = (level: number) => {
  if (level < 95) return 5;
  if (level <= 107) return 10;
  if (level <= 127) return 15;
  if (level <= 137) return 20;
  return 30;
};

export const PROB_TABLE_SUCCESS_INDEX = 0;
export const PROB_TABLE_MAINTAIN_INDEX = 1;
export const PROB_TABLE_DESTROY_INDEX = 2;

/**
 *
 * @returns [상승, 유지, 파괴][]
 */
export const getProbTable = (
  starcatchRecord: { [key: number]: boolean },
  safeguardRecord: { [key: number]: boolean },
  event: Event | null = null,
) => {
  if (
    event === "21성 이하 파괴 확률 30% 감소" ||
    event === "샤타포스" ||
    event === "샤타포스(15 16 포함)"
  ) {
    Array.from({ length: 22 }).forEach((_, i) => {
      const destroyProbability =
        starforceProbTable[i][PROB_TABLE_DESTROY_INDEX];
      starforceProbTable[i][PROB_TABLE_DESTROY_INDEX] =
        destroyProbability * 0.7;
      starforceProbTable[i][PROB_TABLE_MAINTAIN_INDEX] +=
        destroyProbability * 0.3;
    });
  }

  if (event === "5/10/15성 100%" || event === "샤타포스(15 16 포함)") {
    [5, 10, 15].forEach((i) => {
      starforceProbTable[i][PROB_TABLE_SUCCESS_INDEX] = 1;
      starforceProbTable[i][PROB_TABLE_MAINTAIN_INDEX] = 0;
      starforceProbTable[i][PROB_TABLE_DESTROY_INDEX] = 0;
    });
  }

  const starcatchTable = starforceProbTable.map((row) => {
    const successProb = row[PROB_TABLE_SUCCESS_INDEX] * 1.05;

    return [
      successProb,
      ((1 - successProb) * row[PROB_TABLE_MAINTAIN_INDEX]) /
        (1 - row[PROB_TABLE_SUCCESS_INDEX]),
      ((1 - successProb) * row[PROB_TABLE_DESTROY_INDEX]) /
        (1 - row[PROB_TABLE_SUCCESS_INDEX]),
    ];
  });

  return starforceProbTable.map((defaultRow, index) => {
    const result = [
      ...(starcatchRecord[`${index}`] ? starcatchTable[index] : defaultRow),
    ];

    if (safeguardRecord[index]) {
      result[PROB_TABLE_MAINTAIN_INDEX] += result[PROB_TABLE_DESTROY_INDEX];
      result[PROB_TABLE_DESTROY_INDEX] = 0;
    }

    return result;
  });
};

export const getCosts = (equipLevel: number): number[] => {
  return Array.from({ length: 30 }).map((_, star) => {
    if (star <= 9) {
      return (
        Math.round((1000 + (equipLevel ** 3 * (star + 1)) / 36) / 100) * 100
      );
    }

    const base = equipLevel ** 3 * (star + 1) ** 2.7;

    return (
      1000 +
      Math.round(
        match(star)
          .with(10, () => base / 571)
          .with(11, () => base / 314)
          .with(12, () => base / 214)
          .with(13, () => base / 157)
          .with(14, () => base / 107)
          .with(17, () => base / 150)
          .with(18, () => base / 70)
          .with(19, () => base / 45)
          .with(21, () => base / 125)
          .otherwise(() => base / 200) / 100,
      ) *
        100
    );
  });
};

export const getDiscountRatio = (discounts: Discount[]) => {
  return discounts.reduce((acc, discount) => acc + discountRatio[discount], 0);
};
