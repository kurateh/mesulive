import { useMolecule } from "bunshi/react";
import { useAtom } from "jotai";
import { useState } from "react";

import { StarforceSimulatorMolecule } from "~/app/(starforce-simulator)/sim/starforce/_lib/molecule";
import { keys } from "~/shared/object";
import { Button, SectionSubtitle } from "~/shared/ui";

export const SafeguardButtonGroup = () => {
  const [shouldSelectAll, setShouldSelectAll] = useState(true);
  const { safeGuardRecordAtom } = useMolecule(StarforceSimulatorMolecule);
  const [safeGuardRecord, setSafeguardRecord] = useAtom(safeGuardRecordAtom);

  return (
    <div>
      <div className="flex items-center">
        <SectionSubtitle>파괴방지</SectionSubtitle>
        <Button
          color="primary"
          size="sm"
          variant="light"
          className="ml-1"
          onPress={() => {
            setSafeguardRecord((prev) =>
              keys(prev).reduce<typeof safeGuardRecord>(
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
      <div className="mt-2 flex overflow-hidden rounded-2xl border-1 border-default">
        {keys(safeGuardRecord).map((star) => (
          <Button
            key={star}
            className="w-0 flex-1 border-default text-default-500 [&:nth-child(n+2)]:border-l"
            variant={safeGuardRecord[star] ? "flat" : "light"}
            radius="none"
            onPress={() => {
              setSafeguardRecord((prev) => ({
                ...prev,
                [star]: !prev[star],
              }));
            }}
            isDisabled={
              star === "15" &&
              (event === "5/10/15성 100%" || event === "샤타포스")
            }
          >
            {star}성
          </Button>
        ))}
      </div>
    </div>
  );
};
