import { useMolecule } from "bunshi/react";
import { pipe } from "fp-ts/lib/function";
import { useAtom } from "jotai";

import { StarforceSimulatorMolecule } from "~/app/(starforce-simulator)/sim/starforce/_lib/molecule";
import { Starforce } from "~/entities/starforce";
import { E } from "~/shared/fp";
import { Radio, RadioGroup, SectionSubtitle } from "~/shared/ui";
import { parseZod } from "~/shared/zod";

const NONE = "none";

export const EventRadioGroup = () => {
  const { eventAtom } = useMolecule(StarforceSimulatorMolecule);
  const [event, setEvent] = useAtom(eventAtom);

  return (
    <div>
      <SectionSubtitle>스타포스 이벤트</SectionSubtitle>
      <RadioGroup
        className="mt-2"
        value={event ?? NONE}
        size="sm"
        onValueChange={(v) => {
          setEvent(
            pipe(
              v === NONE ? null : v,
              parseZod(Starforce.eventSchema.nullable()),
              E.getOrElseW(() => null),
            ),
          );
        }}
      >
        <Radio value={NONE} key={NONE}>
          없음
        </Radio>
        {Starforce.events.map((event) => (
          <Radio key={event} value={event}>
            {Starforce.eventLabelRecord[event]}
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );
};
