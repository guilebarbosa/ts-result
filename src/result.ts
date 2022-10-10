export type MatchResultOptions<T, E> = {
  ok: (value: T) => any;
  err: (err: E) => any;
};

export function ok<T>(value: T): OkResult<T> {
  return new OkResult(value)
}

export function err<E>(value: E): ErrResult<E> {
  return new ErrResult(value)
}

export function isResult<T, E>(value: Result<T, E>): value is Result<T, E> {
  return value instanceof Result
}

export async function fromPromise<T, E>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    const value = await promise
    return ok(value)
  } catch(e) {
    return err(e as E)
  }
}

export class Result<T, E> {
  constructor(private readonly value: T | E) {}

  isErr() { 
    return this instanceof ErrResult
  }
  
  isOk() { 
    return !this.isErr()
  }

  match(options: MatchResultOptions<T, E>): any {
    try {
      const value = this.unwrap()
      return options.ok(value)
    } catch (e) {
      return options.err(e as E)
    }
  }

  unwrap(): T {
    if (this.isOk()) {
      return this.value as T;
    }
  
    throw this.value;
  }

  unwrapErr(): E {
    if (this.isErr()) {
      return this.value as E
    }

    throw new Error(`Result value is not an error: ${this.value}`)
  }

  unwrapOrElse(fn: (result: E) => T): T {
    return this.match({
      ok: (value) => value,
      err: (e) => fn(e)
    })
  }

  unwrapOrDefault(defaultValue: T): T {
    return this.unwrapOrElse(() => defaultValue)
  }

  mapOk<U>(
    fn: (value: T) => U
  ): Result<U, E> {
    return this.isOk()
      ? ok(fn(this.unwrap()))
      : err(this.unwrapErr())
  }

  mapErr<U>(
    fn: (value: E) => U
  ): Result<T, U> {
    return this.isErr()
    ? err(fn(this.unwrapErr()))
    : ok(this.unwrap())
  }
}

class OkResult<T> extends Result<T, never> {
  constructor(value: T) {
    super(value)
  }
}

class ErrResult<E> extends Result<never, E> {
  constructor(value: E) {
    super(value)
  }

  unwrapOrElse<U>(fn: (result: E) => U): U {
    return fn(this.unwrapErr())
  }

  unwrapOrDefault<U>(defaultValue: U): U {
    return defaultValue
  }

  mapErr<U>(fn: (value: E) => U): ErrResult<U> {
    return new ErrResult(fn(this.unwrapErr()))
  }
}

function getNumber(fail = false): Result<number, Error> {
  if (fail) {
    return err(new Error('foo'))
  }

  return ok(10)
}

console.log(err('').mapErr(() => "some string").mapOk(() => 10).unwrapOrDefault(100))
