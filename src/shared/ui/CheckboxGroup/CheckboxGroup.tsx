"use client";

import {
  // eslint-disable-next-line no-restricted-imports
  CheckboxGroup as CheckboxGroupOrig,
  type CheckboxGroupProps,
} from "@heroui/react";
import { forwardRef } from "react";

import { cx } from "~/shared/style";

export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  ({ classNames, ...props }, ref) => {
    return (
      <CheckboxGroupOrig
        ref={ref}
        classNames={{
          ...classNames,
          label: cx("font-bold text-default-800", classNames?.label),
        }}
        {...props}
      />
    );
  },
);
