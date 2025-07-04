export interface PoolProps {
  id?: string;
  address: string;
  name: string;
  tokenAAddress: string;
  tokenBAddress: string;
  liquidity: number;
  volume24h: number;
  fees24h: number;
  apr: number;
  tvl: number;
  price: number;
  priceChange24h: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Pool {
  private constructor(
    private readonly _id: string,
    private readonly _address: string,
    private readonly _name: string,
    private readonly _tokenAAddress: string,
    private readonly _tokenBAddress: string,
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
  ) {}

  static create(props: PoolProps): Pool {
    const now = new Date();
    
    return new Pool(
      props.id || this.generateId(),
      props.address,
      props.name,
      props.tokenAAddress,
      props.tokenBAddress,
      props.liquidity,
      props.volume24h,
      props.fees24h,
      props.apr,
      props.tvl,
      props.price,
      props.priceChange24h,
      props.isActive,
      props.createdAt || now,
      props.updatedAt || now
    );
  }

  private static generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
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

  get tokenAAddress(): string {
    return this._tokenAAddress;
  }

  get tokenBAddress(): string {
    return this._tokenBAddress;
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
  ): void {
    this._liquidity = liquidity;
    this._volume24h = volume24h;
    this._fees24h = fees24h;
    this._apr = apr;
    this._tvl = tvl;
    this._price = price;
    this._priceChange24h = priceChange24h;
    this._updatedAt = new Date();
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
      tokenAAddress: this._tokenAAddress,
      tokenBAddress: this._tokenBAddress,
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