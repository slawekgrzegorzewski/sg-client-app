import {Income} from './income';
import {Expense} from './expense';

export class BillingPeriodInfo {
  public result: BillingPeriod;
  public unfinishedBillingPeriods: BillingPeriod[];

  constructor(data?: any) {
    this.result = data && data.result && new BillingPeriod(data.result) || null;
    this.unfinishedBillingPeriods = data && data.unfinishedBillingPeriods && data.unfinishedBillingPeriods.map(up => new BillingPeriod(up)) || [];
  }
}

export class BillingPeriod {
  public id: number;
  public name: string;
  public period: Date;
  public incomes: Income[];
  public expenses: Expense[];
  public userName: string;

  constructor(data?: any) {
    this.id = data && data.id;
    this.name = data && data.name || '';
    this.period = data && new Date(data.period) || null;
    this.incomes = data && data.incomes && data.incomes.map(income => new Income(income)) || [];
    this.expenses = data && data.expenses && data.expenses.map(income => new Expense(income)) || [];
    this.userName = data && data.userName || '';
  }
}
