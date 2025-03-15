// eslint-disable-next-line no-restricted-imports
import { Input as InputOrig } from "@heroui/react";
import { forwardRef, useEffect, useRef } from "react";

import { mergeRefs } from "~/shared/react";

export const Input = forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof InputOrig>
>(({ ...props }, _ref) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
      },
      { passive: false },
    );
  }, []);

  return <InputOrig {...props} ref={mergeRefs(ref, _ref)} />;
});
