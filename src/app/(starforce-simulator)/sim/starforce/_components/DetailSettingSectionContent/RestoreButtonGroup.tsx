import { Link } from "@heroui/react";
import { useMolecule } from "bunshi/react";
import { useAtom, useAtomValue } from "jotai";

import { StarforceSimulatorMolecule } from "~/app/(starforce-simulator)/sim/starforce/_lib/molecule";
import { Starforce } from "~/entities/starforce";
import { keys } from "~/shared/object";
import { Button, Checkbox, SectionSubtitle } from "~/shared/ui";

export const RestoreButtonGroup = () => {
  const {
    restoreRecordAtom,
    restoreAvailableStarsAtom,
    isRestoreEnabledAtom,
    isAutoOptimizeRestoreAtom,
  } = useMolecule(StarforceSimulatorMolecule);
  const [restoreRecord, setRestoreRecord] = useAtom(restoreRecordAtom);
  const [isAutoOptimizeRestore, setIsAutoOptimizeRestore] = useAtom(
    isAutoOptimizeRestoreAtom,
  );
  const restoreAvailableStars = useAtomValue(restoreAvailableStarsAtom);
  const isRestoreEnabled = useAtomValue(isRestoreEnabledAtom);
  const isManualControlDisabled = !isRestoreEnabled || isAutoOptimizeRestore;

  const isAllSelected =
    restoreAvailableStars.length > 0 &&
    restoreAvailableStars.every((star) => restoreRecord[`${star}`]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex">
          <SectionSubtitle>흔적 복구</SectionSubtitle>
          <Button
            color="primary"
            size="sm"
            variant="light"
            className="ml-1"
            isDisabled={isManualControlDisabled}
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
          showAnchorIcon
        >
          데이터 출처: 인벤 법사캐
        </Link>
      </div>

      <Checkbox
        size="sm"
        isDisabled={!isRestoreEnabled}
        isSelected={isAutoOptimizeRestore}
        onValueChange={setIsAutoOptimizeRestore}
      >
        흔적 복구 최적화
      </Checkbox>
      <p className="mt-1 text-xs text-default-500">
        자동으로 유리한 흔적 복구 구간을 선택합니다.
      </p>

      <div className="mt-4 grid grid-cols-4 overflow-hidden rounded-2xl border border-default">
        {Starforce.restoreAvailableStar.map((star) => (
          <Button
            key={star}
            radius="none"
            variant={restoreRecord[`${star}`] ? "flat" : "light"}
            isDisabled={isManualControlDisabled}
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

      {isAutoOptimizeRestore && isRestoreEnabled && (
        <p className="mt-1 text-xs text-default-500">
          자동 최적화가 활성화되어 있어 수동으로 복구 구간을 선택할 수 없습니다.
        </p>
      )}

      {!isRestoreEnabled && (
        <p className="mt-1 text-xs text-default-500">
          장비 레벨이 {Starforce.restoreAvailableLevels.join(", ")} 중 하나이고,
          <br />
          목표 스타포스가 16성 이상일 때 활성화됩니다.
        </p>
      )}
    </div>
  );
};
