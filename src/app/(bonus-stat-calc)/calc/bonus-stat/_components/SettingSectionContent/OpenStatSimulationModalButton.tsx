"use client";

import { useSetAtom } from "jotai";

import { bonusStatCalcAtoms } from "~/app/(bonus-stat-calc)/calc/bonus-stat/_lib";
import { Button } from "~/shared/ui";

export const OpenStatSimulationModalButton = () => {
  const setIsStatSimulationModalOpen = useSetAtom(
    bonusStatCalcAtoms.isStatSimulationModalOpen,
  );

  return (
    <Button
      className="w-full lg:hidden"
      color="secondary"
      onPress={() => {
        setIsStatSimulationModalOpen(true);
      }}
    >
      스탯 환산치 계산
    </Button>
  );
};
