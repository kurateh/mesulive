import { type Starforce } from "~/entities/starforce";

export type RestoreRecoveryCostStatsByStar = Partial<
  Record<
    `${Starforce.RestoreAvailableStar}`,
    {
      totalCost: number;
      sampleCount: number;
    }
  >
>;

export interface SimulateStarforceInput {
  level: number;
  spareCost: number;
  currentStar: number;
  targetStar: number;

  safeguardRecord: { [key: `${number}`]: boolean };
  restoreRecord: { [key: `${number}`]: boolean };
  starcatchRecord: { [key: `${number}`]: boolean };
  event: Starforce.Event | null;
  discounts: Starforce.Discount[];

  simulationTotalCount: number;
  simulationSetCount: number;
  collectRestoreRecoveryCostStats: boolean;
}

export type SimulateStarforceOutput =
  | { type: "calculating" }
  | {
      type: "done";
      costs: number[];
      destroyedCounts: number[];
      restoreRecoveryCostStatsByStar: RestoreRecoveryCostStatsByStar | null;
    };
