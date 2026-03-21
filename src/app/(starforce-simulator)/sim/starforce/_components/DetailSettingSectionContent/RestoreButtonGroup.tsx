import { Link } from "@heroui/react";
import { useMolecule } from "bunshi/react";
import { useAtom, useAtomValue } from "jotai";

import { StarforceSimulatorMolecule } from "~/app/(starforce-simulator)/sim/starforce/_lib/molecule";
import { Starforce } from "~/entities/starforce";
import { keys } from "~/shared/object";
import { cx } from "~/shared/style";
import { Button, SectionSubtitle } from "~/shared/ui";

export const RestoreButtonGroup = () => {
  const { restoreRecordAtom, restoreAvailableStarsAtom, isRestoreEnabledAtom } =
    useMolecule(StarforceSimulatorMolecule);
  const [restoreRecord, setRestoreRecord] = useAtom(restoreRecordAtom);
  const restoreAvailableStars = useAtomValue(restoreAvailableStarsAtom);
  const isRestoreEnabled = useAtomValue(isRestoreEnabledAtom);

  const isAllSelected =
    restoreAvailableStars.length > 0 &&
    restoreAvailableStars.every((star) => restoreRecord[`${star}`]);

  return (
    <div className={cx(!isRestoreEnabled && "opacity-60")}>
      <div className="flex items-center justify-between">
        <div className="flex">
          <SectionSubtitle>확정 복구</SectionSubtitle>
          <Button
            color="primary"
            size="sm"
            variant="light"
            className="ml-1"
            isDisabled={!isRestoreEnabled}
            onPress={() => {
              setRestoreRecord((prev) =>
                keys(prev).reduce<typeof restoreRecord>(
                  (acc, key) => ({
                    ...acc,
                    [key]: !isAllSelected,
                  }),
                  {},
                ),
              );
            }}
          >
            {isAllSelected ? "모두 해제" : "모두 선택"}
          </Button>
        </div>
        <Link
          href="https://www.inven.co.kr/board/maple/2304/47118"
          target="_blank"
          rel="noreferrer"
          color="primary"
          size="sm"
          className="text-xs"
          underline="always"
        >
          데이터 출처: 인벤 법사캐
        </Link>
      </div>

      <div className="mt-2 grid grid-cols-4 overflow-hidden rounded-2xl border border-default">
        {Starforce.restoreAvailableStar.map((star) => (
          <Button
            key={star}
            radius="none"
            variant={restoreRecord[`${star}`] ? "flat" : "light"}
            isDisabled={!isRestoreEnabled}
            onPress={() => {
              setRestoreRecord((prev) => ({
                ...prev,
                [`${star}`]: !prev[`${star}`],
              }));
            }}
            className="min-w-0 border-l border-t border-default text-default-500
              [&:nth-child(-n+4)]:border-t-0 [&:nth-child(4n-3)]:border-l-0"
          >
            {star}성
          </Button>
        ))}
      </div>

      {!isRestoreEnabled && (
        <p className="mt-1 text-xs text-default-500">
          장비 레벨이 {Starforce.restoreAvailableLevels.join(", ")} 중 하나이고,
          목표 구간이 16성 이상일 때 활성화됩니다.
        </p>
      )}
    </div>
  );
};
