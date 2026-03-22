import {
  getRestoreRequiredSpareCount,
  getRecoveryTargetStarWithoutRestore,
  getRestoreTargetStar,
} from "./utils";

const createRestoreRecord = (enabledStars: number[] = []) =>
  ({
    "15": enabledStars.includes(15),
    "16": enabledStars.includes(16),
    "17": enabledStars.includes(17),
    "18": enabledStars.includes(18),
    "19": enabledStars.includes(19),
    "20": enabledStars.includes(20),
    "21": enabledStars.includes(21),
    "22": enabledStars.includes(22),
  }) as { [key: `${number}`]: boolean };

describe("getRestoreTargetStar", () => {
  it("파괴 성수 복구가 켜져 있으면 해당 성수로 복구한다", () => {
    expect(
      getRestoreTargetStar({
        destroyedAtStar: 21,
        level: 200,
        restoreRecord: createRestoreRecord([21]),
      }),
    ).toBe(21);
  });

  it("22성 복구가 켜져 있으면 23성 이상 파괴 시 22성으로 복구한다", () => {
    expect(
      getRestoreTargetStar({
        destroyedAtStar: 24,
        level: 200,
        restoreRecord: createRestoreRecord([22]),
      }),
    ).toBe(22);
  });

  it("22성 복구가 꺼져 있으면 23성 이상 파괴 시 복구하지 않는다", () => {
    expect(
      getRestoreTargetStar({
        destroyedAtStar: 24,
        level: 200,
        restoreRecord: createRestoreRecord(),
      }),
    ).toBeNull();
  });

  it("복구 가능 레벨이 아니면 복구하지 않는다", () => {
    expect(
      getRestoreTargetStar({
        destroyedAtStar: 24,
        level: 120,
        restoreRecord: createRestoreRecord([22]),
      }),
    ).toBeNull();
  });
});

describe("getRecoveryTargetStarWithoutRestore", () => {
  it("23성 이상 파괴 시 복구 비교 기준을 22성으로 본다", () => {
    expect(
      getRecoveryTargetStarWithoutRestore({
        destroyedAtStar: 25,
        level: 200,
      }),
    ).toBe(22);
  });

  it("15~22성 파괴 시 해당 성수를 복구 비교 기준으로 본다", () => {
    expect(
      getRecoveryTargetStarWithoutRestore({
        destroyedAtStar: 19,
        level: 200,
      }),
    ).toBe(19);
  });

  it("복구 범위를 벗어난 파괴 성수는 비교 대상이 아니다", () => {
    expect(
      getRecoveryTargetStarWithoutRestore({
        destroyedAtStar: 14,
        level: 200,
      }),
    ).toBeNull();
  });
});

describe("getRestoreRequiredSpareCount", () => {
  it("복구 가능 성수면 필요한 스페어 개수를 반환한다", () => {
    expect(
      getRestoreRequiredSpareCount({
        level: 200,
        star: 21,
      }),
    ).toBe(3);
  });

  it("복구가 불가능한 성수면 null을 반환한다", () => {
    expect(
      getRestoreRequiredSpareCount({
        level: 200,
        star: 14,
      }),
    ).toBeNull();
  });

  it("복구 가능 레벨이 아니면 null을 반환한다", () => {
    expect(
      getRestoreRequiredSpareCount({
        level: 120,
        star: 15,
      }),
    ).toBeNull();
  });
});
