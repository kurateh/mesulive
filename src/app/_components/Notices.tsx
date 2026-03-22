import "server-only";

import { Alert, Link, type AlertProps } from "@heroui/react";
import { omit } from "lodash-es";
import { CirclePlus } from "lucide-react";

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
        <Link
          href="/sim/starforce"
          className="text-sm font-bold text-white"
          underline="always"
          showAnchorIcon
        >
          스타포스 시뮬레이터
        </Link>
        흔적 복구 관련 기능 추가
      </>
    ),
    date: new Date("2026-03-21"),
    classNames: {
      base: cx("bg-primary-500"),
      alertIcon: cx("fill-white text-primary-500"),
    },
    icon: <CirclePlus />,
  },
  {
    variant: "solid",
    color: "danger",
    description: (
      <>
        <Link
          href="/sim/starforce"
          className="text-sm font-bold text-white"
          underline="always"
          showAnchorIcon
        >
          스타포스 시뮬레이터
        </Link>
        3/22 13:18 23성 이상을 목표로 시뮬레이션을 진행할 때 흔적 복구 기능이
        정상적으로 작동하지 않는 문제가 있었습니다. 현재는 수정된 상태이며,
        불편을 드려 죄송합니다. 죄송합니다.
      </>
    ),
    date: new Date("2026-03-21"),
    classNames: {
      base: cx("bg-danger-500"),
      alertIcon: cx("fill-white text-danger-500"),
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
