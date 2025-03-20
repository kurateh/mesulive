import { type ComponentProps } from "react";

import { Flame, PotentialSVG, Star } from "~/shared/assets/images";

import { type NavLink } from "./NavLink";

export const linkData: Record<string, ComponentProps<typeof NavLink>[]> = {
  "기댓값 계산기": [
    {
      href: "https://mesu.live/calc/bonus-stat",
      Icon: Flame,
      children: "추가옵션",
    },
    {
      href: "https://mesu.live/calc/potential",
      Icon: PotentialSVG,
      children: "잠재능력",
      Label: "UPDATED",
    },
  ],
  시뮬레이터: [
    {
      href: "https://mesu.live/sim/starforce",
      Icon: Star,
      children: "스타포스",
      Label: "UPDATED",
    },
    {
      href: "/sim/starforce",
      Icon: Star,
      children: "스타포스(구버전)",
    },
  ],
};
