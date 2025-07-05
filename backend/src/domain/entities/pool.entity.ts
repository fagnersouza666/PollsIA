import { Result } from '../../shared/result';
import { DomainError, ValidationError } from '../../shared/errors/domain.errors';

export interface PoolProps {
  id?: string;
  address?: string;
  name?: string;
  tokenA: string;
  tokenB: string;
  fee: number;
  initialPrice: number;
  liquidity?: number;
  volume24h?: number;
  fees24h?: number;
  apr?: number;
  tvl?: number;
  price?: number;
  priceChange24h?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Pool {
  private constructor(
    private readonly _id: string,
    private readonly _address: string,
    private readonly _name: string,
    private readonly _tokenA: string,
    private readonly _tokenB: string,
    private readonly _fee: number,
    private _liquidity: number,
    private _volume24h: number,
    private _fees24h: number,
    private _apr: number,
    private _tvl: number,
    private _price: number,
    private _priceChange24h: number,
    private _isActive: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) { }

  static create(props: PoolProps): Result<Pool, DomainError> {
    // Validate required properties
    const validation = this.validateProps(props);
    if (validation.isFailure) {
      return Result.fail(validation.getError());
    }

    const now = new Date();

    const pool = new Pool(
      props.id || this.generateId(),
      props.address || this.generateAddress(props.tokenA, props.tokenB),
      props.name || this.generateName(props.tokenA, props.tokenB),
      props.tokenA,
      props.tokenB,
      props.fee,
      props.liquidity || 0,
      props.volume24h || 0,
      props.fees24h || 0,
      props.apr || 0,
      props.tvl || 0,
      props.price || props.initialPrice,
      props.priceChange24h || 0,
      props.isActive ?? true,
      props.createdAt || now,
      props.updatedAt || now
    );

    return Result.ok(pool);
  }

  private static validateProps(props: PoolProps): Result<void, DomainError> {
    const errors: string[] = [];

    if (!props.tokenA || props.tokenA.trim() === '') {
      errors.push('TokenA is required');
    }

    if (!props.tokenB || props.tokenB.trim() === '') {
      errors.push('TokenB is required');
    }

    if (props.tokenA === props.tokenB) {
      errors.push('TokenA and TokenB cannot be the same');
    }

    if (typeof props.fee !== 'number' || props.fee < 0 || props.fee > 1) {
      errors.push('Fee must be a number between 0 and 1');
    }

    if (typeof props.initialPrice !== 'number' || props.initialPrice <= 0) {
      errors.push('Initial price must be a positive number');
    }

    if (errors.length > 0) {
      return Result.fail(new ValidationError('Invalid pool properties', errors));
    }

    return Result.ok();
  }

  private static generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private static generateAddress(tokenA: string, tokenB: string): string {
    return `pool_${tokenA}_${tokenB}_${Date.now()}`;
  }

  private static generateName(tokenA: string, tokenB: string): string {
    return `${tokenA}/${tokenB} Pool`;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get address(): string {
    return this._address;
  }

  get name(): string {
    return this._name;
  }

  get tokenA(): string {
    return this._tokenA;
  }

  get tokenB(): string {
    return this._tokenB;
  }

  get fee(): number {
    return this._fee;
  }

  get liquidity(): number {
    return this._liquidity;
  }

  get volume24h(): number {
    return this._volume24h;
  }

  get fees24h(): number {
    return this._fees24h;
  }

  get apr(): number {
    return this._apr;
  }

  get tvl(): number {
    return this._tvl;
  }

  get price(): number {
    return this._price;
  }

  get priceChange24h(): number {
    return this._priceChange24h;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  updateMetrics(
    liquidity: number,
    volume24h: number,
    fees24h: number,
    apr: number,
    tvl: number,
    price: number,
    priceChange24h: number
  ): Result<void, DomainError> {
    if (liquidity < 0 || volume24h < 0 || fees24h < 0 || tvl < 0 || price <= 0) {
      return Result.fail(new ValidationError('Invalid metrics: values must be non-negative (price must be positive)', []));
    }

    this._liquidity = liquidity;
    this._volume24h = volume24h;
    this._fees24h = fees24h;
    this._apr = apr;
    this._tvl = tvl;
    this._price = price;
    this._priceChange24h = priceChange24h;
    this._updatedAt = new Date();

    return Result.ok();
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  isHighVolume(): boolean {
    return this._volume24h > 1000000; // $1M+ daily volume
  }

  isHighAPR(): boolean {
    return this._apr > 0.5; // 50%+ APR
  }

  isProfitable(): boolean {
    return this._fees24h > 0 && this._apr > 0;
  }

  toJSON() {
    return {
      id: this._id,
      address: this._address,
      name: this._name,
      tokenA: this._tokenA,
      tokenB: this._tokenB,
      fee: this._fee,
      liquidity: this._liquidity,
      volume24h: this._volume24h,
      fees24h: this._fees24h,
      apr: this._apr,
      tvl: this._tvl,
      price: this._price,
      priceChange24h: this._priceChange24h,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}