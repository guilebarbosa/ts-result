export type Result<T, E extends Error> = OkResult<T> | ErrResult<E>;
export type OkResult<T> = { value: T; isOk: true; isErr: false };
export type ErrResult<E extends Error> = { value: E; isOk: false; isErr: true };
export type MatchResultOptions<T, E extends Error> = {
  ok: (value: T) => any;
  err: (err: E) => any;
};
export function ok<T>(value: T): OkResult<T> {
  return Object.freeze({ value, isOk: true, isErr: false });
}

export function err<E extends Error>(value: E): ErrResult<E> {
  return Object.freeze({ value, isOk: false, isErr: true });
}

export function isResult<T, E extends Error>(value: Result<T, E>): value is Result<T, E> {
  if (typeof value !== "object" || value === null) return false;
  return ["value", "isOk", "isErr"].every((attr) => value.hasOwnProperty(attr));
}

export function matchResult<T, E extends Error>(
  result: Result<T, E>,
  options: MatchResultOptions<T, E>
): any {
  if (result.isOk) {
    return options.ok(result.value);
  }

  return options.err(result.value);
}


export function unwrap<T, E extends Error>(result: Result<T, E>): T {
  if (result.isOk) {
    return result.value;
  }

  throw result.value;
}

export function unwrapOrElse<T, E extends Error>(
  result: Result<T, E>,
  fn: (result: Result<T, E>) => T
): T {
  if (result.isOk) {
    return result.value;
  }

  return fn(result);
}

export function unwrapOrDefault<T, E extends Error>(
  result: Result<T, E>,
  defaultValue: T
): T {
  return unwrapOrElse(result, () => defaultValue);
}

export function mapOk<T, E extends Error, U>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  return result.isOk ? ok(fn(result.value)) : result;
}

export function mapErr<T, E extends Error, U extends Error>(result: Result<T, E>, fn: (value: E) => U): Result<T, U> {
  return result.isErr ? err(fn(result.value)) : result;
}

export function fromPromise<T>(promise: Promise<T>): Promise<Result<T, Error>> {
  return promise.then((value) => ok(value)).catch((e) => err(e));
}
