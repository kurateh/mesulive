// eslint-disable-next-line no-restricted-imports
import { Input as InputOrig } from "@nextui-org/react";
import { forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof InputOrig>
>(({ type, onWheel, ...props }, ref) => {
  return (
    <InputOrig
      {...props}
      ref={ref}
      onWheel={
        (onWheel ?? type === "number")
          ? (e) => {
              e.preventDefault();
            }
          : undefined
      }
    />
  );
});
