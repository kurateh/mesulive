"use client";

import { useMolecule } from "bunshi/react";
import { useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { RefreshCcw } from "lucide-react";

import { PotentialCalcMolecule } from "~/app/(potential-calc)/calc/potential/_lib/molecules";
import { Button } from "~/shared/ui";

export const RefreshButton = () => {
  const { refinedOptionSetFormAtom, currentOptionPresetAtom } = useMolecule(
    PotentialCalcMolecule,
  );
  const setOptionSets = useSetAtom(refinedOptionSetFormAtom);
  const setCurrentOptionPreset = useSetAtom(currentOptionPresetAtom);

  return (
    <Button
      size="sm"
      onPress={() => {
        setOptionSets(RESET);
        setCurrentOptionPreset(RESET);
      }}
      className="ml-2 w-20"
      variant="flat"
      color="primary"
    >
      <RefreshCcw className="size-4" /> 초기화
    </Button>
  );
};
