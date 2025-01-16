import { cn } from "@heroui/react";
import { type HTMLAttributes, forwardRef, type CSSProperties } from "react";

export const PageTitle = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    startColorVar?: string;
    endColorVar?: string;
  }
>(
  (
    {
      children,
      className,
      style,
      startColorVar = "var(--mesulive-primary)",
      endColorVar = "var(--mesulive-primary-600)",
      ...restProps
    },
    ref,
  ) => (
    <h1
      ref={ref}
      className={cn(
        `inline bg-gradient-to-r from-[hsl(var(--page-title-start-color))]
        to-[hsl(var(--page-title-end-color))] bg-clip-text text-2xl font-extrabold
        text-transparent lg:text-3xl`,
        className,
      )}
      style={
        {
          "--page-title-start-color": startColorVar,
          "--page-title-end-color": endColorVar,
          ...style,
        } as CSSProperties
      }
      {...restProps}
    >
      {children}
    </h1>
  ),
);
