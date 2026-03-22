import { match } from "ts-pattern";

import {
  discountRatio,
  eventsWithDestroyReduction,
  eventsWithGuaranteedSuccess,
  eventsWithRestoreMesoDiscount,
  isRestoreAvailableLevel,
  isStarforceRestoreAvailableStar,
  probTable,
  restoreResourceTable,
  type Discount,
  type Event,
  type RestoreAvailableStar,
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
  safeguardRecord: { [key: number]: boolean },
  event: Event | null = null,
) => {
  const table = structuredClone(probTable);

  if (event !== null && eventsWithDestroyReduction.includes(event)) {
    Array.from({ length: 22 }).forEach((_, i) => {
      const destroyProbability = table[i][PROB_TABLE_DESTROY_INDEX];
      table[i][PROB_TABLE_DESTROY_INDEX] = destroyProbability * 0.7;
      table[i][PROB_TABLE_MAINTAIN_INDEX] += destroyProbability * 0.3;
    });
  }

  if (event !== null && eventsWithGuaranteedSuccess.includes(event)) {
    [5, 10, 15].forEach((i) => {
      table[i][PROB_TABLE_SUCCESS_INDEX] = 1;
      table[i][PROB_TABLE_MAINTAIN_INDEX] = 0;
      table[i][PROB_TABLE_DESTROY_INDEX] = 0;
    });
  }

  return table.map((defaultRow, index) => {
    const result = [...defaultRow];

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

const HUNDRED_MILLION = 100_000_000;

export const getRestoreTargetStar = ({
  destroyedAtStar,
  level,
  restoreRecord,
}: {
  destroyedAtStar: number;
  level: number;
  restoreRecord: { [key: `${number}`]: boolean };
}): RestoreAvailableStar | null => {
  if (!isRestoreAvailableLevel(level)) {
    return null;
  }

  if (
    isStarforceRestoreAvailableStar(destroyedAtStar) &&
    restoreRecord[`${destroyedAtStar}`]
  ) {
    return destroyedAtStar;
  }

  if (destroyedAtStar > 22 && restoreRecord["22"]) {
    return 22;
  }

  return null;
};

export const getRecoveryTargetStarWithoutRestore = ({
  destroyedAtStar,
  level,
}: {
  destroyedAtStar: number;
  level: number;
}): RestoreAvailableStar | null => {
  if (!isRestoreAvailableLevel(level)) {
    return null;
  }

  if (destroyedAtStar > 22) {
    return 22;
  }

  if (isStarforceRestoreAvailableStar(destroyedAtStar)) {
    return destroyedAtStar;
  }

  return null;
};

export const getRestoreTotalCost = ({
  level,
  star,
  spareCost,
  event,
}: {
  level: number;
  star: number;
  spareCost: number;
  event: Event | null;
}) => {
  if (
    !isRestoreAvailableLevel(level) ||
    !isStarforceRestoreAvailableStar(star)
  ) {
    return null;
  }

  const [requiredSpareCount, restoreCostInHundredMillions] =
    restoreResourceTable[level][star];
  const restoreCostMeso = Math.round(
    restoreCostInHundredMillions * HUNDRED_MILLION,
  );

  if (requiredSpareCount <= 0 || restoreCostMeso <= 0) {
    return null;
  }

  const restoreMesoDiscountRatio =
    event !== null && eventsWithRestoreMesoDiscount.includes(event) ? 0.2 : 0;
  const discountedRestoreCostMeso = Math.round(
    restoreCostMeso * (1 - restoreMesoDiscountRatio),
  );

  return spareCost * requiredSpareCount + discountedRestoreCostMeso;
};
