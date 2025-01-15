import { useMolecule } from "bunshi/react";
import { pipe } from "fp-ts/lib/function";
import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";

import { StarforceSimulatorMolecule } from "~/app/(starforce-simulator)/sim/starforce/_lib/molecule";
import { E, O } from "~/shared/fp";
import { convertToNumber } from "~/shared/number";
import { keys } from "~/shared/object";
import { Button, SectionSubtitle } from "~/shared/ui";

export const StarcatchButtonGroup = () => {
  const [shouldSelectAll, setShouldSelectAll] = useState(true);

  const { starcatchRecordAtom, currentStarforceAtom } = useMolecule(
    StarforceSimulatorMolecule,
  );
  const [starcatchRecord, setStarcatchRecord] = useAtom(starcatchRecordAtom);
  const currentStarforce = useAtomValue(currentStarforceAtom);

  return (
    <div>
      <div className="flex items-center">
        <SectionSubtitle>스타캐치</SectionSubtitle>
        <Button
          size="sm"
          variant="light"
          color="primary"
          className="ml-1"
          onPress={() => {
            setStarcatchRecord((prev) =>
              keys(prev).reduce<typeof starcatchRecord>(
                (acc, key) => ({
                  ...acc,
                  [key]: shouldSelectAll,
                }),
                {},
              ),
            );

            setShouldSelectAll((prev) => !prev);
          }}
        >
          {shouldSelectAll ? "모두 선택" : "모두 해제"}
        </Button>
      </div>
      <div
        className="mt-2 grid grid-cols-5 grid-rows-5 overflow-hidden rounded-2xl border
          border-default"
      >
        {keys(starcatchRecord).map((star) => (
          <Button
            key={star}
            radius="none"
            variant={starcatchRecord[star] ? "flat" : "light"}
            onPress={() => {
              setStarcatchRecord((prev) => ({
                ...prev,
                [star]: !prev[star],
              }));
            }}
            className="border-l border-t border-default text-default-500 [&:nth-child(-n+5)]:border-t-0
              [&:nth-child(5n-4)]:border-l-0"
            isDisabled={pipe(
              convertToNumber(star),
              O.map(
                (star) =>
                  !(
                    star >= 12 ||
                    pipe(
                      currentStarforce.value,
                      E.getOrElse(() => 0),
                      (currentStar) => currentStar <= star,
                    )
                  ),
              ),
              O.toUndefined,
            )}
          >
            {star}성
          </Button>
        ))}
      </div>
    </div>
  );
};
