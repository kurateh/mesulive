import { match } from "ts-pattern";

import { discountRatio, type Discount, type Event } from "./constants";

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
  const defaultTable = [
    [0.95, 0.05, 0], // 0
    [0.9, 0.1, 0], // 1
    [0.85, 0.15, 0], // 2
    [0.85, 0.15, 0], // 3
    [0.8, 0.2, 0], // 4
    [0.75, 0.25, 0], // 5
    [0.7, 0.3, 0], // 6
    [0.65, 0.35, 0], // 7
    [0.6, 0.4, 0], // 8
    [0.55, 0.45, 0], // 9
    [0.5, 0.5, 0], // 10
    [0.45, 0.55, 0], // 11
    [0.4, 0.6, 0], // 12
    [0.35, 0.65, 0], // 13
    [0.3, 0.7, 0], // 14
    [0.3, 0.679, 0.021], // 15
    [0.3, 0.679, 0.021], // 16
    [0.15, 0.782, 0.068], // 17
    [0.15, 0.782, 0.068], // 18
    [0.15, 0.765, 0.085], // 19
    [0.3, 0.595, 0.105], // 20
    [0.15, 0.7225, 0.1275], // 21
    [0.15, 0.68, 0.17], // 22
    [0.1, 0.72, 0.18], // 23
    [0.1, 0.72, 0.18], // 24
    [0.1, 0.72, 0.18], // 25
    [0.07, 0.744, 0.186], // 26
    [0.05, 0.76, 0.19], // 27
    [0.03, 0.776, 0.194], // 28
    [0.01, 0.792, 0.198], // 29
  ];

  if (event === "21성 이하 파괴 확률 30% 감소" || event === "샤타포스") {
    Array.from({ length: 22 }).forEach((_, i) => {
      const destroyProbability = defaultTable[i][PROB_TABLE_DESTROY_INDEX];
      defaultTable[i][PROB_TABLE_DESTROY_INDEX] = destroyProbability * 0.7;
      defaultTable[i][PROB_TABLE_MAINTAIN_INDEX] += destroyProbability * 0.3;
    });
  }

  if (event === "5/10/15성 100%") {
    [5, 10, 15].forEach((i) => {
      defaultTable[i][PROB_TABLE_SUCCESS_INDEX] = 1;
      defaultTable[i][PROB_TABLE_MAINTAIN_INDEX] = 0;
      defaultTable[i][PROB_TABLE_DESTROY_INDEX] = 0;
    });
  }

  const starcatchTable = defaultTable.map((row) => {
    const successProb = row[PROB_TABLE_SUCCESS_INDEX] * 1.05;

    return [
      successProb,
      ((1 - successProb) * row[PROB_TABLE_MAINTAIN_INDEX]) /
        (1 - row[PROB_TABLE_SUCCESS_INDEX]),
      ((1 - successProb) * row[PROB_TABLE_DESTROY_INDEX]) /
        (1 - row[PROB_TABLE_SUCCESS_INDEX]),
    ];
  });

  return defaultTable.map((defaultRow, index) => {
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
