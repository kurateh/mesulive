import { z } from "zod";

export const eventSchema = z.enum([
  "10성 이하 1+1",
  "30% 할인",
  "21성 이하 파괴 확률 30%",
  "샤타포스",
]);
export type Event = z.infer<typeof eventSchema>;
export const events = eventSchema.options;
export const eventLabelRecord: Record<Event, string> = {
  "10성 이하 1+1": "10성 이하에서 강화 시 1+1",
  "30% 할인": "비용 30% 할인",
  "21성 이하 파괴 확률 30%": "21성 이하에서 파괴 확률 30% 감소",
  샤타포스: "샤이닝 스타포스",
};

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
