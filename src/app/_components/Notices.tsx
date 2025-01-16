import "server-only";

import { Alert, Link, type AlertProps } from "@nextui-org/react";
import { omit } from "lodash-es";
import { CirclePlus } from "lucide-react";
import NextLink from "next/link";

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
})[] = [
  {
    variant: "solid",
    color: "primary",
    description: (
      <>
        2025.01.17{" "}
        <Link
          as={NextLink}
          prefetch={false}
          href="/sim/starforce"
          className="text-sm text-white"
          underline="always"
          showAnchorIcon
        >
          스타포스 시뮬레이터
        </Link>
        가 <b>신버전</b>으로 교체되었습니다.
      </>
    ),
    date: new Date("2025-1-17"),
    classNames: {
      base: cx("bg-primary-400"),
      alertIcon: cx("fill-white text-primary-400"),
    },
    icon: <CirclePlus />,
  },
];

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
