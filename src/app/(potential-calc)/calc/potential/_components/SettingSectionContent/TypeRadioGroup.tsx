"use client";

import { useMolecule } from "bunshi/react";
import { useAtom } from "jotai";

import { PotentialCalcMolecule } from "~/app/(potential-calc)/calc/potential/_lib/molecules";
import { Potential } from "~/entities/potential";
import { cx } from "~/shared/style";
import { S } from "~/shared/ui";

interface Props {
  className?: string;
}

export const TypeRadioGroup = ({ className }: Props) => {
  const { typeAtom } = useMolecule(PotentialCalcMolecule);
  const [type, setType] = useAtom(typeAtom);

  return (
    <S.RadioGroup
      label="잠재능력 타입"
      className={cx(className)}
      size="sm"
      onValueChange={(value) => {
        setType(value);
      }}
      value={type}
    >
      {Potential.types.map((type) => (
        <S.Radio key={type} value={type}>
          {Potential.typeLabels[type]}
        </S.Radio>
      ))}
    </S.RadioGroup>
  );
};