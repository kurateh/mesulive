// eslint-disable-next-line no-restricted-imports
import { Input as InputOrig } from "@heroui/react";
import { forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof InputOrig>
>(({ onWheel, ...props }, ref) => {
  return (
    <InputOrig
      {...props}
      ref={ref}
      onWheel={
        (onWheel ?? props.type === "number")
          ? (e) => {
              e.preventDefault();
            }
          : undefined
      }
    />
  );
});
