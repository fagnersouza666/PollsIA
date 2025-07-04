export class CreatePoolCommand {
  constructor(
    public readonly address: string,
    public readonly name: string,
    public readonly tokenAAddress: string,
    public readonly tokenBAddress: string,
    public readonly initialLiquidityA: number,
    public readonly initialLiquidityB: number,
    public readonly fee: number
  ) {}

  validate(): string[] {
    const errors: string[] = [];

    if (!this.address || this.address.trim().length === 0) {
      errors.push('Pool address is required');
    }

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Pool name is required');
    }

    if (!this.tokenAAddress || this.tokenAAddress.trim().length === 0) {
      errors.push('Token A address is required');
    }

    if (!this.tokenBAddress || this.tokenBAddress.trim().length === 0) {
      errors.push('Token B address is required');
    }

    if (this.tokenAAddress === this.tokenBAddress) {
      errors.push('Token A and Token B must be different');
    }

    if (this.initialLiquidityA <= 0) {
      errors.push('Initial liquidity for Token A must be positive');
    }

    if (this.initialLiquidityB <= 0) {
      errors.push('Initial liquidity for Token B must be positive');
    }

    if (this.fee < 0 || this.fee > 1) {
      errors.push('Fee must be between 0 and 1');
    }

    return errors;
  }

  isValid(): boolean {
    return this.validate().length === 0;
  }
}