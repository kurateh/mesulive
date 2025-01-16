import { type Starforce } from "~/entities/starforce";

export interface SimulateStarforceInput {
  level: number;
  spareCost: number;
  currentStar: number;
  targetStar: number;

  safeguardRecord: { [key: `${number}`]: boolean };
  starcatchRecord: { [key: `${number}`]: boolean };
  event: Starforce.Event | null;
  discounts: Starforce.Discount[];

  simulationTotalCount: number;
  simulationSetCount: number;
}

export type SimulateStarforceOutput =
  | { type: "calculating" }
  | {
      type: "done";
      costs: number[];
      destroyedCounts: number[];
    };
