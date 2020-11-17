export class PiggyBank {
  public id: number;
  public name: string;
  public description: string;
  public balance: number;
  public currency: string;
  public userName: string;

  constructor(data?: any) {
    this.id = data && data.id;
    this.name = data && data.name || '';
    this.description = data && data.description || '';
    this.balance = data && data.balance || 0;
    this.currency = data && data.currency || '';
    this.userName = data && data.userName || '';
  }
}
