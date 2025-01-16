import { identity, pipe } from "fp-ts/lib/function";
import { type Atom, useAtomValue } from "jotai";
import { ArrowRightLeftIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { O } from "~/shared/fp";
import { maxFractionDigits, maxFractionDigitsString } from "~/shared/math";
import { TopPctCost } from "~/shared/math/geometricDistribution";
import { convertToNumber, putUnit } from "~/shared/number";
import { cx } from "~/shared/style";
import { Input } from "~/shared/ui";

const MAX_FRAC_DIGITS = 3;

interface Props {
  dataAtom: Atom<number[]>;
  type: "cost" | "destroyedCount";
}

export const TopPercent = ({ dataAtom, type }: Props) => {
  const data = useAtomValue(dataAtom);
  const topPctCost = useRef(
    new TopPctCost({
      type: "data",
      samples: data,
    }),
  );

  const [cost, setCost] = useState("");
  const [topPct, setTopPct] = useState("");

  const initialMeanCostUnitFracDigits = type === "cost" ? 0 : 2;
  const unit = type === "cost" ? "메소" : "회";

  useEffect(() => {
    topPctCost.current = new TopPctCost({
      type: "data",
      samples: data,
    });

    setCost(
      pipe(
        O.fromNullable(topPctCost.current.meanCost),
        O.map(maxFractionDigitsString(initialMeanCostUnitFracDigits)),
        O.getOrElse(() => ""),
      ),
    );

    setTopPct(
      pipe(
        O.fromNullable(topPctCost.current.meanTopPct),
        O.map(maxFractionDigitsString(MAX_FRAC_DIGITS)),
        O.getOrElse(() => ""),
      ),
    );
  }, [data, initialMeanCostUnitFracDigits]);

  return (
    <div>
      <p className="text-sm text-default-600">
        평균:{" "}
        {(type === "cost" || (topPctCost.current.meanCost || 0) >= 10000
          ? putUnit
          : identity)(
          maxFractionDigits(initialMeanCostUnitFracDigits)(
            topPctCost.current.meanCost || 0,
          ),
        )}
      </p>
      <div className="mt-2 flex items-start gap-2">
        <Input
          classNames={{ base: cx("flex-1") }}
          type="number"
          startContent={
            <span className="break-keep text-sm font-bold text-default-500">
              상위
            </span>
          }
          endContent={
            <span className="break-keep text-sm font-bold text-default-500">
              %
            </span>
          }
          value={topPct}
          onValueChange={(v) => {
            const converted = convertToNumber(v);

            setTopPct(v);

            setCost(
              pipe(
                converted,
                O.map((v) => topPctCost.current.getCostFromTopPct(v)),
                O.chain(O.fromNullable),
                O.map(maxFractionDigits(0)),
                O.match(() => "", String),
              ),
            );
          }}
        />
        <ArrowRightLeftIcon className="mt-2 size-6 text-default-500" />
        <Input
          classNames={{ base: cx("flex-1") }}
          type="number"
          value={cost}
          onValueChange={(v) => {
            const converted = convertToNumber(v);

            setCost(
              pipe(
                converted,
                O.map(maxFractionDigits(0)),
                O.match(() => "", String),
              ),
            );

            setTopPct(
              pipe(
                converted,

                O.map((v) => topPctCost.current.getTopPctFromCost(v)),
                O.chain(O.fromNullable),
                O.map(maxFractionDigits(MAX_FRAC_DIGITS)),
                O.match(() => "", String),
              ),
            );
          }}
          endContent={
            <span className="break-keep text-sm font-bold text-default-500">
              {unit}
            </span>
          }
          description={pipe(
            cost,
            convertToNumber,
            O.filter((v) => v >= 10000),
            O.map(putUnit),
            O.getOrElse(() => "ㅤ"),
          )}
        />
      </div>
    </div>
  );
};
