"use client";

import { createScope, molecule, type MoleculeConstructor } from "bunshi";
import { flow, identity, pipe } from "fp-ts/lib/function";
import { atom } from "jotai";
import { z } from "zod";

import { Starforce } from "~/entities/starforce";
import { E, O } from "~/shared/fp";
import { convertToNumber } from "~/shared/number";
import { type FormPayload } from "~/shared/react";
import { parseZodWithErrorMessage } from "~/shared/zod";

export const StarforceSimulatorScope = createScope(undefined, {
  debugLabel: "starforce/sim",
});

const starforceSimulatorMoleculeConstructor = ((_, scope) => {
  scope(StarforceSimulatorScope);

  const _levelAtom = atom<FormPayload<number>>({
    input: "",
    value: E.left("레벨을 입력해주세요."),
  });
  const levelAtom = atom(
    (get) => get(_levelAtom),
    (get, set, input: string) => {
      set(_levelAtom, {
        input,
        value: pipe(
          input,
          E.fromPredicate(
            (s) => s !== "",
            () => "레벨을 입력해주세요.",
          ),
          E.chain(
            flow(
              convertToNumber,
              O.toNullable,
              parseZodWithErrorMessage(
                z
                  .number({ message: "레벨을 입력해주세요." })
                  .int({ message: "정수를 입력해주세요." })
                  .min(0, {
                    message: "0 이상의 값을 입력해주세요.",
                  })
                  .max(300, {
                    message: "300 이하의 값을 입력해주세요.",
                  }),
              ),
            ),
          ),
        ),
      });
    },
  );

  const _spareCostAtom = atom<FormPayload<number>>({
    input: "",
    value: E.of(0),
  });
  const spareCostAtom = atom(
    (get) => get(_spareCostAtom),
    (get, set, input: string) => {
      set(_spareCostAtom, {
        input,
        value: pipe(
          convertToNumber(input || 0),
          O.toNullable,
          parseZodWithErrorMessage(
            z.number({ message: "올바른 값을 입력해주세요." }),
          ),
        ),
      });
    },
  );

  const _currentStarInputAtom = atom("");
  const currentStarAtom = atom(
    (get): FormPayload<number> => {
      const level = pipe(
        get(levelAtom).value,
        E.getOrElse(() => 200),
      );
      const reachableStar = Starforce.getReachableStar(level);

      return pipe(get(_currentStarInputAtom), (input) => ({
        input,
        value: pipe(
          convertToNumber(input || 0),
          O.toNullable,
          parseZodWithErrorMessage(
            z
              .number({ message: "올바른 값을 입력해주세요." })
              .int({
                message: "정수를 입력해주세요.",
              })
              .min(0, {
                message: "0 이상의 값을 입력해주세요.",
              })
              .max(reachableStar - 1, {
                message: `${reachableStar} 이하의 값을 입력해주세요.`,
              }),
          ),
        ),
      }));
    },
    (get, set, input: string) => {
      set(_currentStarInputAtom, input);
    },
  );

  const _targetStarInputAtom = atom("");

  const targetStarAtom = atom(
    (get): FormPayload<number> => {
      const currentStarforce = pipe(
        get(currentStarAtom).value,
        E.getOrElse(() => 0),
      );
      const level = pipe(
        get(levelAtom).value,
        E.getOrElse(() => 200),
      );
      const reachableStar = Starforce.getReachableStar(level);

      return pipe(get(_targetStarInputAtom), (input) => ({
        input,
        value: pipe(
          input,
          E.fromPredicate(
            (s) => s !== "",
            () => "목표 스타포스를 입력해주세요.",
          ),
          E.chain(
            flow(
              convertToNumber,
              O.toNullable,
              parseZodWithErrorMessage(
                z
                  .number({ message: "올바른 값을 입력해주세요." })
                  .int({
                    message: "정수를 입력해주세요.",
                  })
                  .min(0, {
                    message: "0 이상의 값을 입력해주세요.",
                  })
                  .min(currentStarforce + 1, {
                    message: "현재 스타포스보다 높은 값을 입력해주세요.",
                  })
                  .max(reachableStar, {
                    message: `${reachableStar} 이하의 값을 입력해주세요.`,
                  }),
              ),
            ),
          ),
        ),
      }));
    },
    (get, set, input: string) => {
      set(_targetStarInputAtom, input);
    },
  );

  // 시뮬레이션 횟수
  const _simulationCountAtom = atom<FormPayload<number>>({
    input: "100000",
    value: E.of(100000),
  });
  const simulationCountAtom = atom(
    (get) => get(_simulationCountAtom),
    (get, set, input: string) => {
      set(_simulationCountAtom, {
        input,
        value: pipe(
          input,
          E.fromPredicate(
            (s) => s !== "",
            () => "시뮬레이션 횟수를 입력해주세요.",
          ),
          E.chain(
            flow(
              convertToNumber,
              O.toNullable,
              parseZodWithErrorMessage(
                z
                  .number({ message: "올바른 값을 입력해주세요." })
                  .int({
                    message: "정수를 입력해주세요.",
                  })
                  .min(1, {
                    message: "1 이상의 값을 입력해주세요.",
                  })
                  .max(1000000, {
                    message: "100만 이하의 값을 입력해주세요.",
                  }),
              ),
            ),
          ),
        ),
      });
    },
  );

  const safeGuardRecordAtom = atom<{ [key: `${number}`]: boolean }>({
    15: false,
    16: false,
  });

  const starcatchRecordAtom = atom<{ [key: `${number}`]: boolean }>(
    Array.from({ length: 25 }).reduce<{ [key: number]: boolean }>(
      (acc, _, i) => ({ ...acc, [i]: false }),
      {},
    ),
  );

  const eventAtom = atom<Starforce.Event | null>(null);

  const discountsAtom = atom<Starforce.Discount[]>([]);

  const inputsAtom = atom((get) =>
    pipe(
      E.Do,
      E.apS(
        "level",
        pipe(
          get(levelAtom).value,
          E.mapLeft(() => "장비 레벨을 정확히 입력해주세요."),
        ),
      ),
      E.apS(
        "spareCost",
        pipe(
          get(spareCostAtom).value,
          E.mapLeft(() => "스페어 비용을 정확히 입력해주세요."),
        ),
      ),
      E.apS(
        "currentStar",
        pipe(
          get(currentStarAtom).value,
          E.mapLeft(() => "현재 스타포스 수치를 정확히 입력해주세요."),
        ),
      ),
      E.apS(
        "targetStar",
        pipe(
          get(targetStarAtom).value,
          E.mapLeft(() => "목표 스타포스 수치를 정확히 입력해주세요."),
        ),
      ),
      E.apS(
        "simulationCount",
        pipe(
          get(simulationCountAtom).value,
          E.mapLeft(() => "시뮬레이션 횟수를 정확히 입력해주세요."),
        ),
      ),
      E.map((inputs) => ({
        ...inputs,
        safeguardRecord: get(safeGuardRecordAtom),
        starcatchRecord: get(starcatchRecordAtom),
        event: get(eventAtom),
        discounts: get(discountsAtom),
      })),
    ),
  );

  const inputsErrorMessageAtom = atom((get) =>
    pipe(
      get(inputsAtom),
      E.match(identity, () => null),
    ),
  );

  const resultsAtom = atom<{ cost: number; destroyed: number }[]>([]);

  return {
    levelAtom,
    spareCostAtom,
    currentStarAtom,
    targetStarAtom,
    simulationCountAtom,
    safeGuardRecordAtom,
    starcatchRecordAtom,
    eventAtom,
    discountsAtom,
    inputsAtom,
    inputsErrorMessageAtom,
    resultsAtom,
  };
}) satisfies MoleculeConstructor<unknown>;

export const StarforceSimulatorMolecule = molecule(
  starforceSimulatorMoleculeConstructor,
);

export type StarforceSimulatorMoleculeStructure = ReturnType<
  typeof starforceSimulatorMoleculeConstructor
>;
