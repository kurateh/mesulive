import "server-only";

import { Alert, type AlertProps } from "@heroui/react";
import { omit } from "lodash-es";

import { cx } from "~/shared/style";
import { mergeClassNames } from "~/shared/style/utils";
import { type Optional } from "~/shared/types";

interface Props {
  classNames?: AlertProps["classNames"] & { container?: string };
}

const noticeContents: (Optional<
  Pick<AlertProps, "variant" | "description" | "color" | "classNames" | "icon">,
  "variant" | "color"
> & {
  date: Date;
})[] = [];

export const revalidate = 86400;

export const Notices = ({ classNames }: Props) => {
  const now = new Date();
  const contents = noticeContents.filter(
    ({ date }) =>
      Math.abs(now.getTime() - date.getTime()) <= 10 * 24 * 60 * 60 * 1000,
  );

  return contents.length > 0 ? (
    <div className={cx("my-2 flex flex-col gap-2", classNames?.container)}>
      {contents.map(
        (
          { variant, color, description, classNames: contentClassNames, icon },
          index,
        ) => (
          <Alert
            key={index}
            radius="full"
            icon={icon}
            variant={variant ?? "faded"}
            color={color ?? "primary"}
            classNames={mergeClassNames(
              {
                base: cx("items-center rounded-[20px] px-4 py-2"),
                iconWrapper: cx("h-6 w-6 border-none shadow-none"),
                title: cx("hidden"),
                mainWrapper: cx("ms-1 min-h-8 justify-center"),
                description: cx("font-semibold"),
              },
              contentClassNames,
              omit(classNames, "container"),
            )}
            description={description}
          />
        ),
      )}
    </div>
  ) : null;
};
