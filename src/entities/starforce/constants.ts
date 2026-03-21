import { z } from "zod";

export const eventSchema = z.enum([
  "10성 이하 1+1",
  "30% 할인",
  "5/10/15성 100%",
  "21성 이하 파괴 확률 30% 감소",
  "샤타포스",
  "샤타포스(15 16 포함)",
]);
export type Event = z.infer<typeof eventSchema>;
export const events = eventSchema.options;
export const eventLabelRecord: Record<Event, string> = {
  "10성 이하 1+1": "10성 이하에서 강화 시 1+1",
  "30% 할인": "비용 30% 할인",
  "5/10/15성 100%": "5, 10, 15성에서 강화 시 성공확률 100%",
  "21성 이하 파괴 확률 30% 감소": "21성 이하에서 파괴 확률 30% 감소",
  샤타포스: "샤이닝 스타포스",
  "샤타포스(15 16 포함)": "샤이닝 스타포스 (5/10/15성 100% 포함)",
};
export const eventsInShiningStarforce: Exclude<Event, "샤타포스">[] = [
  "30% 할인",
  "21성 이하 파괴 확률 30% 감소",
];

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
export const starforceProbTable = [
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
