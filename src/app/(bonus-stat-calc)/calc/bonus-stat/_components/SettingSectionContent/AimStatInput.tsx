"use client";

import { type InputProps } from "@heroui/react";
import { pipe } from "fp-ts/lib/function";
import { useAtom, useAtomValue } from "jotai";

import { bonusStatCalcAtoms } from "~/app/(bonus-stat-calc)/calc/bonus-stat/_lib";
import { E, O } from "~/shared/fp";
import { convertToNumber } from "~/shared/number";
import { Input } from "~/shared/ui";
import { getFirstZodErrorMessage } from "~/shared/zod";

type Props = Pick<InputProps, "classNames">;

export const AimStatInput = ({ classNames }: Props) => {
  const [aimStat, setAimStat] = useAtom(bonusStatCalcAtoms.aimStat);
  const aimStatParseResult = useAtomValue(
    bonusStatCalcAtoms.aimStatParseResult,
  );
  const aimStatErrorMessage = pipe(
    aimStatParseResult,
    E.match(getFirstZodErrorMessage, () => O.none),
    O.toUndefined,
  );
  const equipType = useAtomValue(bonusStatCalcAtoms.equipType);
  const isTouched = aimStat != null;

  return (
    <Input
      classNames={classNames}
      label="목표 추가옵션 값"
      type="number"
      onValueChange={(v) => {
        setAimStat(pipe(convertToNumber(v), O.toUndefined));
      }}
      defaultValue={aimStat?.toString() || undefined}
      isInvalid={isTouched && E.isLeft(aimStatParseResult)}
      errorMessage={isTouched && aimStatErrorMessage}
      description={
        equipType === "WEAPON" &&
        "무기 공격력/마력 추옵에 대한 환산 스탯은 제외됩니다."
      }
      placeholder={equipType === "WEAPON" ? "0" : undefined}
    />
  );
};
