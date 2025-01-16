"use client";

// eslint-disable-next-line no-restricted-imports
import { type ButtonProps, Button as ButtonOrig } from "@heroui/react";
import { forwardRef } from "react";

import { cx } from "~/shared/style";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <ButtonOrig
        ref={ref}
        className={cx(
          "font-semibold data-[disabled=true]:pointer-events-auto",
          className,
        )}
        {...props}
      />
    );
  },
) as typeof ButtonOrig;
