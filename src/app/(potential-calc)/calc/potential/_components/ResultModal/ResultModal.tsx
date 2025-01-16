"use client";

import { ModalBody, ModalContent } from "@heroui/react";
import { useAtomValue } from "jotai";
import { type ComponentProps } from "react";

import { type PotentialCalcMoleculeStructure } from "~/app/(potential-calc)/calc/potential/_lib/molecules";
import { Potential } from "~/entities/potential";
import { Modal, ModalHeader } from "~/shared/ui";

import { OptionResultSection } from "./OptionResultSection";
import { ResultSection } from "./ResultSection";

interface Props extends Omit<ComponentProps<typeof Modal>, "children"> {
  resultAtom: PotentialCalcMoleculeStructure["resultAtom"];
  grade: Potential.Grade;
  level: number;
  aimType: Potential.AimType;
}

export const ResultModal = ({
  resultAtom,
  grade,
  level,
  aimType,
  ...props
}: Props) => {
  const results = useAtomValue(resultAtom).toSorted(
    (a, b) =>
      Potential.resetMethods.indexOf(a.method) -
      Potential.resetMethods.indexOf(b.method),
  );

  return (
    <Modal
      size={aimType === "OPTIONS" ? "4xl" : "2xl"}
      className="h-4/5"
      {...props}
    >
      <ModalContent className="flex flex-col">
        <ModalHeader>결과</ModalHeader>
        <ModalBody className="flex h-0 flex-1 flex-row gap-4 pb-6 *:flex-1">
          <div className="flex h-full flex-col gap-6 overflow-y-auto">
            {results.map((result) => (
              <ResultSection
                className="pr-2"
                key={result.method}
                result={result}
                grade={grade}
                level={level}
              />
            ))}
          </div>
          {aimType === "OPTIONS" && (
            <div className="hidden h-full flex-col gap-6 overflow-y-auto md:flex">
              {results.map((result) => (
                <OptionResultSection
                  className="pl-2"
                  key={result.method}
                  result={result}
                />
              ))}
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
