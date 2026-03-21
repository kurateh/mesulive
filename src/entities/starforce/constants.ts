import { z } from "zod";

export const eventSchema = z.enum([
  "10성 이하 1+1",
  "30% 할인",
  "흔적 복구 비용 20% 할인",
  "5/10/15성 100%",
  "21성 이하 파괴 확률 30% 감소",
  "샤타포스",
  "샤타포스(+흔적 복구 비용 20% 할인)",
  "샤타포스(15 16 포함)",
]);
export type Event = z.infer<typeof eventSchema>;
export const events = eventSchema.options;
export const eventLabelRecord: Record<Event, string> = {
  "10성 이하 1+1": "10성 이하에서 강화 시 1+1",
  "30% 할인": "비용 30% 할인",
  "흔적 복구 비용 20% 할인": "흔적 복구 비용 중 메소 비용 20% 할인",
  "5/10/15성 100%": "5, 10, 15성에서 강화 시 성공확률 100%",
  "21성 이하 파괴 확률 30% 감소": "21성 이하에서 파괴 확률 30% 감소",
  샤타포스: "샤이닝 스타포스",
  "샤타포스(+흔적 복구 비용 20% 할인)":
    "샤이닝 스타포스 (+흔적 복구 비용 20% 할인)",
  "샤타포스(15 16 포함)": "샤이닝 스타포스 (+ 5/10/15성 100%)",
};
export const eventsInShiningStarforce: Event[] = [
  "30% 할인",
  "21성 이하 파괴 확률 30% 감소",
];
export const shiningStarforceEvents: Event[] = [
  "샤타포스",
  "샤타포스(+흔적 복구 비용 20% 할인)",
  "샤타포스(15 16 포함)",
];
export const eventsWithDestroyReduction: Event[] = [
  "21성 이하 파괴 확률 30% 감소",
  "샤타포스",
  "샤타포스(+흔적 복구 비용 20% 할인)",
  "샤타포스(15 16 포함)",
];
export const eventsWithGuaranteedSuccess: Event[] = [
  "5/10/15성 100%",
  "샤타포스(15 16 포함)",
];
export const eventsWithGlobalCostDiscount: Event[] = [
  "30% 할인",
  "샤타포스",
  "샤타포스(+흔적 복구 비용 20% 할인)",
  "샤타포스(15 16 포함)",
];
export const eventsWithRestoreMesoDiscount: Event[] = [
  "흔적 복구 비용 20% 할인",
  "샤타포스(+흔적 복구 비용 20% 할인)",
];
export const eventsWithOnePlusOne: Event[] = ["10성 이하 1+1"];

export const discountSchema = z.enum([
  "MVP Silver",
  "MVP Gold",
  "MVP Diamond",
  "PC Room",
]);
export const discounts = discountSchema.options;
export type Discount = z.infer<typeof discountSchema>;
export const discountLabelRecord: Record<Discount, string> = {
  "MVP Silver": "MVP 실버",
  "MVP Gold": "MVP 골드",
  "MVP Diamond": "MVP 다이아",
  "PC Room": "PC방",
};
export const discountRatio: Record<Discount, number> = {
  "MVP Silver": 0.03,
  "MVP Gold": 0.05,
  "MVP Diamond": 0.1,
  "PC Room": 0.05,
};

/**
 * [success prob, maintain prob, destroy prob][]
 */
export const probTable = [
  [0.9975, 0.0025, 0], // 0
  [0.945, 0.055, 0], // 1
  [0.8925, 0.1075, 0], // 2
  [0.8925, 0.1075, 0], // 3
  [0.84, 0.16, 0], // 4
  [0.7875, 0.2125, 0], // 5
  [0.735, 0.265, 0], // 6
  [0.6825, 0.3175, 0], // 7
  [0.63, 0.37, 0], // 8
  [0.5775, 0.4225, 0], // 9
  [0.525, 0.475, 0], // 10
  [0.4725, 0.5275, 0], // 11
  [0.42, 0.58, 0], // 12
  [0.3675, 0.6325, 0], // 13
  [0.315, 0.685, 0], // 14
  [0.315, 0.66445, 0.02055], // 15
  [0.315, 0.66445, 0.02055], // 16
  [0.1575, 0.7751, 0.0674], // 17
  [0.1575, 0.7751, 0.0674], // 18
  [0.1575, 0.75825, 0.08425], // 19
  [0.315, 0.58225, 0.10275], // 20
  [0.1575, 0.716125, 0.126375], // 21
  [0.1575, 0.674, 0.1685], // 22
  [0.105, 0.716, 0.179], // 23
  [0.105, 0.716, 0.179], // 24
  [0.105, 0.716, 0.179], // 25
  [0.0735, 0.7416, 0.1853], // 26
  [0.0525, 0.758, 0.1895], // 27
  [0.0315, 0.7748, 0.1937], // 28
  [0.0105, 0.7916, 0.1979], // 29
];

export const restoreAvailableLevels = [
  130, 135, 140, 145, 150, 160, 200, 250,
] as const;
export type RestoreAvailableLevel = (typeof restoreAvailableLevels)[number];
export const isRestoreAvailableLevel = (
  level: number,
): level is RestoreAvailableLevel =>
  restoreAvailableLevels.includes(level as RestoreAvailableLevel);

export const restoreAvailableStar = [15, 16, 17, 18, 19, 20, 21, 22] as const;
export type RestoreAvailableStar = (typeof restoreAvailableStar)[number];
export const isStarforceRestoreAvailableStar = (
  star: number,
): star is RestoreAvailableStar =>
  restoreAvailableStar.includes(star as RestoreAvailableStar);

// [count of equip, meso(hundred millions)]
export const restoreResourceTable: Record<
  RestoreAvailableLevel,
  Record<RestoreAvailableStar, [number, number]>
> = {
  130: {
    15: [1, 1.19],
    16: [1, 2.87],
    17: [1, 4.85],
    18: [1, 11.03],
    19: [2, 18.27],
    20: [0, 0],
    21: [0, 0],
    22: [0, 0],
  },
  135: {
    15: [1, 1.33],
    16: [1, 3.21],
    17: [1, 5.42],
    18: [1, 12.31],
    19: [2, 20.43],
    20: [0, 0],
    21: [0, 0],
    22: [0, 0],
  },
  140: {
    15: [1, 1.48],
    16: [1, 3.58],
    17: [1, 6.05],
    18: [1, 13.74],
    19: [2, 22.79],
    20: [2, 40.15],
    21: [3, 50.45],
    22: [4, 82.9],
  },
  145: {
    15: [1, 1.65],
    16: [1, 3.98],
    17: [1, 6.71],
    18: [1, 15.28],
    19: [2, 25.4],
    20: [2, 44.5],
    21: [3, 56.05],
    22: [4, 92.25],
  },
  150: {
    15: [1, 1.83],
    16: [1, 4.41],
    17: [1, 7.45],
    18: [1, 16.89],
    19: [2, 28.03],
    20: [2, 49.44],
    21: [3, 62.24],
    22: [4, 101.79],
  },
  160: {
    15: [1, 2.22],
    16: [1, 5.35],
    17: [1, 9.03],
    18: [1, 20.5],
    19: [2, 34.02],
    20: [2, 59.93],
    21: [3, 75.31],
    22: [4, 123.74],
  },
  200: {
    15: [1, 4.33],
    16: [1, 10.44],
    17: [1, 17.64],
    18: [1, 40.05],
    19: [2, 66.44],
    20: [2, 117.06],
    21: [3, 147.09],
    22: [4, 241.68],
  },
  250: {
    15: [1, 8.46],
    16: [1, 20.39],
    17: [1, 34.46],
    18: [1, 78.21],
    19: [2, 129.77],
    20: [2, 228.63],
    21: [3, 287.28],
    22: [4, 472.04],
  },
};
