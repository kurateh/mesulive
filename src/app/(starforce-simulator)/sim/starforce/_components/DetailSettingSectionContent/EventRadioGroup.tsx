import { useMolecule } from "bunshi/react";
import { pipe } from "fp-ts/lib/function";
import { useAtom } from "jotai";

import { StarforceSimulatorMolecule } from "~/app/(starforce-simulator)/sim/starforce/_lib/molecule";
import { Starforce } from "~/entities/starforce";
import { E } from "~/shared/fp";
import { cx } from "~/shared/style";
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
          <Radio
            key={event}
            value={event}
            classNames={{
              label: cx(
                (event === "샤타포스" || event === "샤타포스(15 16 포함)") &&
                  "font-bold",
              ),
            }}
          >
            {Starforce.eventLabelRecord[event]}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {Starforce.eventsInShiningStarforce.includes(event as any) && (
              <span className="text-xs font-bold text-primary-500">
                {" "}
                (샤타포스)
              </span>
            )}
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );
};
