export const entries = <T extends Record<string, unknown>>(obj: T) =>
  Object.entries(obj) as [keyof T, T[keyof T]][];

export const values = <T extends Record<string, unknown>>(obj: T) =>
  Object.values(obj) as T[keyof T][];

type Keyof<T> =
  T extends Record<infer K, unknown> ? (K extends symbol ? string : K) : never;

export const keys = <T extends Record<string, unknown>>(obj: T) =>
  Object.keys(obj) as `${Keyof<T>}`[];
