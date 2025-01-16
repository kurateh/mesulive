"use client";

import { Input } from "@nextui-org/react";
import { useMolecule } from "bunshi/react";
import { identity, pipe } from "fp-ts/lib/function";
import { useAtom } from "jotai";

import { StarforceSimulatorMolecule } from "~/app/(starforce-simulator)/sim/starforce/_lib/molecule";
import { E } from "~/shared/fp";
import { putUnit } from "~/shared/number";

export const SpareCostInput = () => {
  const { spareCostAtom } = useMolecule(StarforceSimulatorMolecule);
  const [spareCost, setSpareCost] = useAtom(spareCostAtom);
  const errorMessage = pipe(
    spareCost.value,
    E.match(identity, () => undefined),
  );

  return (
    <Input
      label="스페어 비용"
      type="number"
      value={spareCost.input}
      onValueChange={(value) => {
        setSpareCost(value);
      }}
      isInvalid={!!errorMessage}
      errorMessage={errorMessage}
      description={
        spareCost.input
          ? putUnit(E.getOrElse(() => 0)(spareCost.value))
          : "빈칸이면 0메소로 계산합니다."
      }
      endContent={<span className="min-w-fit text-sm text-gray-400">메소</span>}
    />
  );
};
