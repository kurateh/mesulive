"use client";

import { ModalBody, ModalContent, ModalFooter } from "@heroui/react";
import { sequenceS } from "fp-ts/lib/Apply";
import { flow, pipe } from "fp-ts/lib/function";
import { fromCompare } from "fp-ts/lib/Ord";
import { sign } from "fp-ts/lib/Ordering";
import { ServerCrash } from "lucide-react";
import { overlay } from "overlay-kit";
import { useEffect } from "react";
import {
  createQuery,
  type inferData,
  type inferVariables,
} from "react-query-kit";

import { Potential } from "~/entities/potential";
import { parseStat } from "~/entities/potential/utils";
import { trpc } from "~/features/trpc/client";
import { type RouterInput } from "~/features/trpc/router";
import { A, E, O, TE } from "~/shared/fp";
import {
  convertAllNullToUndefined,
  taskEitherToPromise,
} from "~/shared/function";
import { entries } from "~/shared/object";
import { getQueryClient } from "~/shared/queryClient";
import { Modal, ModalHeader } from "~/shared/ui";

export const useOptionTable = createQuery({
  queryKey: ["potential", "optionTable"],
  fetcher: (variables: Omit<RouterInput["potential"]["getOptionTable"], "v">) =>
    trpc.potential.getOptionTable
      .query({
        ...variables,
        v: process.env.NEXT_PUBLIC_POTENTIAL_DATA_VERSION,
      })
      .then(
        flow(
          A.sort(
            fromCompare<{ name: string }>((a, b) => {
              const getIndex = (name: string) => {
                const regexEntries = entries(Potential.possibleStatRegexRecord);

                const index = regexEntries.findIndex(([_, regex]) =>
                  regex.test(name),
                );

                return index === -1 ? regexEntries.length : index;
              };

              const indexA = getIndex(a.name);
              const indexB = getIndex(b.name);

              return sign(indexA - indexB);
            }),
          ),
          A.map(({ name, ...others }) => ({
            name,
            ...O.toUndefined(parseStat(name)),
            ...others,
          })),
        ),
      ),
  staleTime: 0,
  gcTime: 0,
  use: [
    (useQueryNext) => (options) => {
      const result = useQueryNext(options);

      useEffect(() => {
        if (result.isError) {
          overlay.open(({ close, isOpen, unmount }) => (
            <Modal onClose={close} isOpen={isOpen} onExit={unmount}>
              <ModalContent>
                <ModalHeader className="text-red-500">
                  <ServerCrash />
                  <p className="ml-2">서버 오류</p>
                </ModalHeader>
                <ModalBody className="text-center">
                  잠재능력 데이터를 불러오는데 실패했습니다.
                  <br />
                  같은 문제가 계속 발생한다면 페이지를 새로고침해주세요.
                </ModalBody>
                <ModalFooter />
              </ModalContent>
            </Modal>
          ));
        }
      }, [result.isError]);

      return result;
    },
  ],
});

export const useGradeUpRecord = createQuery({
  queryKey: ["potential", "gradeUpRecord"],
  fetcher: (variables: Omit<RouterInput["potential"]["getGradeUpData"], "v">) =>
    trpc.potential.getGradeUpData.query({
      ...variables,
      v: process.env.NEXT_PUBLIC_POTENTIAL_DATA_VERSION,
    }),
  staleTime: 0,
  gcTime: 0,
  use: [
    (useQueryNext) => (options) => {
      const result = useQueryNext(options);

      useEffect(() => {
        if (result.isError) {
          overlay.open(({ close, isOpen, unmount }) => (
            <Modal onClose={close} isOpen={isOpen} onExit={unmount}>
              <ModalContent>
                <ModalHeader className="text-red-500">
                  <ServerCrash />
                  <p className="ml-2">서버 오류</p>
                </ModalHeader>
                <ModalBody className="text-center">
                  잠재능력 데이터를 불러오는데 실패했습니다.
                  <br />
                  같은 문제가 계속 발생한다면 페이지를 새로고침해주세요.
                </ModalBody>
                <ModalFooter />
              </ModalContent>
            </Modal>
          ));
        }
      }, [result.isError]);

      return result;
    },
  ],
});

export const useOptionGrade = createQuery({
  queryKey: ["potential", "optionGrade"],
  fetcher: (variables: Omit<RouterInput["potential"]["getOptionGrade"], "v">) =>
    trpc.potential.getOptionGrade
      .query({
        ...variables,
        v: process.env.NEXT_PUBLIC_POTENTIAL_DATA_VERSION,
      })
      .then((records) =>
        records
          .toSorted((a, b) => a.line - b.line)
          .map(convertAllNullToUndefined),
      ),
  staleTime: 0,
  gcTime: 0,
});

export const useOptionTables = createQuery({
  queryKey: ["potential", "optionTables"],
  fetcher: (
    variables: Omit<inferVariables<typeof useOptionTable>, "optionGrade"> & {
      grade: Potential.Grade;
    },
  ) =>
    pipe(
      TE.Do,
      TE.apS("queryClient", TE.fromIO(getQueryClient)),
      TE.bind("fetchedData", ({ queryClient }) =>
        sequenceS(TE.ApplyPar)({
          optionGrade: TE.tryCatch(
            () =>
              queryClient.fetchQuery<inferData<typeof useOptionGrade>>(
                useOptionGrade.getOptions({
                  grade: variables.grade,
                  method: variables.method,
                }),
              ),
            E.toError,
          ),
          currentGradeOptions: TE.tryCatch(
            () =>
              queryClient.fetchQuery<inferData<typeof useOptionTable>>(
                useOptionTable.getOptions({
                  equip: variables.equip,
                  level: variables.level,
                  optionGrade: variables.grade,
                  method: variables.method,
                }),
              ),
            E.toError,
          ),
          lowerGradeOptions: TE.tryCatch(
            () =>
              queryClient.fetchQuery<inferData<typeof useOptionTable>>(
                useOptionTable.getOptions({
                  equip: variables.equip,
                  level: variables.level,
                  optionGrade:
                    Potential.optionGrades[
                      Potential.optionGrades.indexOf(variables.grade) - 1
                    ],
                  method: variables.method,
                }),
              ),
            E.toError,
          ),
        }),
      ),
      TE.map(
        ({
          fetchedData: { currentGradeOptions, lowerGradeOptions, optionGrade },
        }) =>
          optionGrade.map(({ currentGradeProb, lowerGradeProb }) => [
            ...(lowerGradeProb
              ? lowerGradeOptions.map((option) => ({
                  ...option,
                  probability: option.probability * lowerGradeProb,
                }))
              : []),
            ...currentGradeOptions.map((option) => ({
              ...option,
              probability: option.probability * currentGradeProb,
            })),
          ]),
      ),
      TE.map(convertAllNullToUndefined),
      taskEitherToPromise,
    ),
  staleTime: 0,
  gcTime: 0,
});

export const PotentialQueries = {
  useOptionTable,
  useGradeUpRecord,
  useOptionTables,
};
