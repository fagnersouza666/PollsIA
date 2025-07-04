export class Result<T, E extends Error> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  static success<T, E extends Error>(value: T): Result<T, E> {
    return new Result<T, E>(true, value);
  }

  static failure<T, E extends Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isFailure(): boolean {
    return !this._isSuccess;
  }

  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value of a failure result');
    }
    return this._value!;
  }

  get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error of a success result');
    }
    return this._error!;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isSuccess) {
      return Result.success(fn(this._value!));
    }
    return Result.failure(this._error!);
  }

  mapError<F extends Error>(fn: (error: E) => F): Result<T, F> {
    if (this._isSuccess) {
      return Result.success(this._value!);
    }
    return Result.failure(fn(this._error!));
  }

  match<U>(
    onSuccess: (value: T) => U,
    onFailure: (error: E) => U
  ): U {
    if (this._isSuccess) {
      return onSuccess(this._value!);
    }
    return onFailure(this._error!);
  }

  async matchAsync<U>(
    onSuccess: (value: T) => Promise<U>,
    onFailure: (error: E) => Promise<U>
  ): Promise<U> {
    if (this._isSuccess) {
      return await onSuccess(this._value!);
    }
    return await onFailure(this._error!);
  }
}