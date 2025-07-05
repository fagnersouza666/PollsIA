export class Result<T, E = Error> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E
  ) {
    if (_isSuccess && _error) {
      throw new Error('InvalidOperation: A result cannot be successful and contain an error');
    }

    if (!_isSuccess && !_error) {
      throw new Error('InvalidOperation: A failing result needs to contain an error message');
    }
  }

  public get isSuccess(): boolean {
    return this._isSuccess;
  }

  public get isFailure(): boolean {
    return !this._isSuccess;
  }

  public getValue(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from a failed result');
    }
    return this._value!;
  }

  public getError(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error from a successful result');
    }
    return this._error!;
  }

  public static ok<U>(value?: U): Result<U, never> {
    return new Result<U, never>(true, value);
  }

  public static fail<U>(error: U): Result<never, U> {
    return new Result<never, U>(false, undefined as never, error);
  }

  public static combine<T>(results: Result<T, any>[]): Result<T[], any> {
    const failures = results.filter(r => r.isFailure);

    if (failures.length > 0) {
      return Result.fail(failures[0].getError());
    }

    return Result.ok(results.map(r => r.getValue()));
  }

  public map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isFailure) {
      return Result.fail(this.getError());
    }

    try {
      return Result.ok(fn(this.getValue()));
    } catch (error) {
      return Result.fail(error as E);
    }
  }

  public flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isFailure) {
      return Result.fail(this.getError());
    }

    return fn(this.getValue());
  }

  public mapError<U>(fn: (error: E) => U): Result<T, U> {
    if (this.isSuccess) {
      return Result.ok(this.getValue());
    }

    return Result.fail(fn(this.getError()));
  }

  public match<U>(
    onSuccess: (value: T) => U,
    onFailure: (error: E) => U
  ): U {
    if (this.isSuccess) {
      return onSuccess(this.getValue());
    }

    return onFailure(this.getError());
  }

  public async matchAsync<U>(
    onSuccess: (value: T) => Promise<U>,
    onFailure: (error: E) => Promise<U>
  ): Promise<U> {
    if (this.isSuccess) {
      return await onSuccess(this.getValue());
    }

    return await onFailure(this.getError());
  }
}

// Utility types
export type ResultValue<T> = T extends Result<infer U, any> ? U : never;
export type ResultError<T> = T extends Result<any, infer E> ? E : never;

// Async Result utilities
export class AsyncResult {
  public static async from<T>(promise: Promise<T>): Promise<Result<T, Error>> {
    try {
      const value = await promise;
      return Result.ok(value);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }

  public static async combine<T>(
    promises: Promise<Result<T, any>>[]
  ): Promise<Result<T[], any>> {
    const results = await Promise.all(promises);
    return Result.combine(results);
  }

  public static async sequence<T>(
    promises: Promise<Result<T, any>>[]
  ): Promise<Result<T[], any>> {
    const results: T[] = [];

    for (const promise of promises) {
      const result = await promise;

      if (result.isFailure) {
        return Result.fail(result.getError());
      }

      results.push(result.getValue());
    }

    return Result.ok(results);
  }
}

// Helper functions
export const ok = Result.ok;
export const fail = Result.fail;
export const fromPromise = AsyncResult.from;