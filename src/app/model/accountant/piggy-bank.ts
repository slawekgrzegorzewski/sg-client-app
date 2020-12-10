export class PiggyBank {
  public id: number;
  public name: string;
  public description: string;
  public balance: number;
  public currency: string;
  public savings: boolean;
  public monthlyTopUp: number;
  public userId: number;

  constructor(data?: any) {
    this.id = data && data.id;
    this.name = data && data.name || '';
    this.description = data && data.description || '';
    this.balance = data && data.balance || 0;
    this.currency = data && data.currency || '';
    this.savings = data && data.savings || false;
    this.monthlyTopUp = data && data.monthlyTopUp || 0;
    this.userId = data && data.userId || 0;
  }
}
