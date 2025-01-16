import { match } from "ts-pattern";

import { discountRatio, type Discount, type Event } from "./constants";

export const getReachableStar = (level: number) => {
  if (level < 95) return 5;
  if (level <= 107) return 10;
  if (level <= 127) return 15;
  if (level <= 137) return 20;
  return 25;
};

/**
 *
 * @returns [상승, 유지, 하락, 파괴][]
 */
export const getProbTable = (
  starcatchRecord: { [key: number]: boolean },
  safeguardRecord: { [key: number]: boolean },
  event: Event | null = null,
) => {
  const defaultTable = [
    [0.95, 0.05, 0, 0],
    [0.9, 0.1, 0, 0],
    [0.85, 0.15, 0, 0],
    [0.85, 0.15, 0, 0],
    [0.8, 0.2, 0, 0],
    [0.75, 0.25, 0, 0],
    [0.7, 0.3, 0, 0],
    [0.65, 0.35, 0, 0],
    [0.6, 0.4, 0, 0],
    [0.55, 0.45, 0, 0],
    [0.5, 0.5, 0, 0],
    [0.45, 0.55, 0, 0],
    [0.4, 0.6, 0, 0],
    [0.35, 0.65, 0, 0],
    [0.3, 0.7, 0, 0],
    [0.3, 0.679, 0, 0.021],
    [0.3, 0, 0.679, 0.021],
    [0.3, 0, 0.679, 0.021],
    [0.3, 0, 0.672, 0.028],
    [0.3, 0, 0.672, 0.028],
    [0.3, 0.63, 0, 0.07],
    [0.3, 0, 0.63, 0.07],
    [0.03, 0, 0.776, 0.194],
    [0.02, 0, 0.686, 0.294],
    [0.01, 0, 0.594, 0.396],
  ];

  const starcatchTable = [
    [0.9975, 0.0025, 0, 0],
    [0.945, 0.055, 0, 0],
    [0.8925, 0.1075, 0, 0],
    [0.8925, 0.1075, 0, 0],
    [0.84, 0.16, 0, 0],
    [0.7875, 0.2125, 0, 0],
    [0.735, 0.265, 0, 0],
    [0.6825, 0.3175, 0, 0],
    [0.63, 0.37, 0, 0],
    [0.5775, 0.4225, 0, 0],
    [0.525, 0.475, 0, 0],
    [0.4725, 0.5275, 0, 0],
    [0.42, 0.58, 0, 0],
    [0.3675, 0.6325, 0, 0],
    [0.315, 0.685, 0, 0],
    [0.315, 0.66445, 0, 0.02055],
    [0.315, 0, 0.66445, 0.02055],
    [0.315, 0, 0.66445, 0.02055],
    [0.315, 0, 0.6576, 0.0274],
    [0.315, 0, 0.6576, 0.0274],
    [0.315, 0.6165, 0, 0.0685],
    [0.315, 0, 0.6165, 0.0685],
    [0.0315, 0, 0.7748, 0.1937],
    [0.021, 0, 0.6853, 0.2937],
    [0.0105, 0, 0.5937, 0.3958],
  ];

  return defaultTable.map((defaultRow, index) => {
    if (
      (event === "5/10/15성 100%" || event === "샤타포스") &&
      (index === 5 || index === 10 || index === 15)
    ) {
      return [1, 0, 0, 0];
    }

    const result = [
      ...(starcatchRecord[`${index}`] ? starcatchTable[index] : defaultRow),
    ];

    if (safeguardRecord[index]) {
      if (result[1] > 0) {
        result[1] += result[3];
      } else {
        result[2] += result[3];
      }
      result[3] = 0;
    }

    return result;
  });
};

export const getCosts = (equipLevel: number): number[] => {
  return Array.from({ length: 25 }).map((_, star) => {
    if (star <= 9) {
      return 1000 + (equipLevel ** 3 * (star + 1)) / 36;
    }

    const base = 1000 + equipLevel ** 3 * (star + 1) ** 2.7;

    return (
      Math.round(
        match(star)
          .with(10, () => base / 571)
          .with(11, () => base / 314)
          .with(12, () => base / 214)
          .with(13, () => base / 157)
          .with(14, () => base / 107)
          .otherwise(() => base / 200) / 100,
      ) * 100
    );
  });
};

export const getDiscountRatio = (discounts: Discount[]) => {
  return discounts.reduce((acc, discount) => acc + discountRatio[discount], 0);
};
