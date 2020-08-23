export class Account {
  public id: number;
  public name: string;
  public currency: string;
  public currentBalance: number;
  public balanceIndex: number;
  public userName: string;

  constructor(data?: any) {
    this.id = data && data.id;
    this.name = data && data.name || '';
    this.currency = data && data.currency || '';
    this.currentBalance = data && data.currentBalance || 0;
    this.balanceIndex = data && data.balanceIndex || 0;
    this.userName = data && data.userName || '';
  }

  public static compareByCurrencyAndName(first: Account, second: Account): number {
    let currencyComparison = first.currency.localeCompare(second.currency);
    if (currencyComparison !== 0) {
      return currencyComparison;
    } else {
      return first.name.localeCompare(second.name);
    }
  }
}
