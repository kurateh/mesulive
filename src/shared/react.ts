import { type Either } from "fp-ts/lib/Either";
import { type ForwardedRef } from "react";

import { E } from "./fp";

export const isServer = () => typeof window === "undefined";

export type FormPayload<V, I = string> = {
  input: I;
  value: Either<string, V>;
};

export const createFormPayload = <T>(defaultValue: T): FormPayload<T> => ({
  input: String(defaultValue),
  value: E.right(defaultValue),
});

export const mergeRefs = <T>(...refs: ForwardedRef<T>[]) => {
  return (instance: T) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(instance);
      } else if (ref) {
        // eslint-disable-next-line no-param-reassign
        ref.current = instance;
      }
    });
  };
};
