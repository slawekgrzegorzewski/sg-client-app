export class CurrencyCalculator {
  public static round(value: number): number {
    return Math.round(value * 100 + Number.EPSILON) / 100;
  }
}
