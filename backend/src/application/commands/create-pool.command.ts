export class CreatePoolCommand {
  constructor(
    public readonly tokenA: string,
    public readonly tokenB: string,
    public readonly fee: number,
    public readonly initialPrice: number,
    public readonly name?: string,
    public readonly address?: string
  ) { }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.tokenA || this.tokenA.trim().length === 0) {
      errors.push('Token A is required');
    }

    if (!this.tokenB || this.tokenB.trim().length === 0) {
      errors.push('Token B is required');
    }

    if (this.tokenA === this.tokenB) {
      errors.push('Token A and Token B must be different');
    }

    if (this.fee < 0 || this.fee > 1) {
      errors.push('Fee must be between 0 and 1');
    }

    if (this.initialPrice <= 0) {
      errors.push('Initial price must be positive');
    }

    return errors;
  }

  isValid(): boolean {
    return this.validate().length === 0;
  }
}